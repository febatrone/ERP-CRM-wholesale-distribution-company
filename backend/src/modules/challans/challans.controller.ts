import { Router } from "express";
import prisma from "../../config/db";
import { authMiddleware, roleMiddleware, AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { z } from "zod";
import { Prisma, Product } from "@prisma/client";
import { Decimal } from "decimal.js";

const router = Router();

const challanItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive()
});

const challanSchema = z.object({
  customerId: z.string().uuid(),
  status: z.enum(["DRAFT", "CONFIRMED"]).default("DRAFT"),
  items: z.array(challanItemSchema).min(1)
});

// Helper: Automatic Challan Number Generation (e.g. CHN-20260811-0001)
async function generateChallanNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `CHN-${dateStr}-`;

  const lastChallan = await prisma.challan.findFirst({
    where: { challanNumber: { startsWith: prefix } },
    orderBy: { createdAt: "desc" }
  });

  let nextSerial = 1;
  if (lastChallan) {
    const parts = lastChallan.challanNumber.split("-");
    const serialStr = parts[parts.length - 1];
    nextSerial = parseInt(serialStr) + 1;
  }

  return `${prefix}${String(nextSerial).padStart(4, "0")}`;
}

// Create Challan (Draft / Confirmed)
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "SALES"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parse = challanSchema.safeParse(req.body);
    if (!parse.success) {
      console.error("CHALLAN VALIDATION FAILED:", parse.error.format());
      return next(new AppError("Validation failed", 400));
    }

    const { customerId, status, items } = parse.data;
    const challanNumber = await generateChallanNumber();
    const createdById = req.user?.id || "";

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Fetch products to perform snapshots and stock verification
      const productIds = items.map((i) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } }
      });

      if (dbProducts.length !== productIds.length) {
        throw new AppError("One or more products invalid", 400);
      }

      const productMap = new Map<string, Product>(dbProducts.map((p) => [p.id, p]));

      // Verify stock level if CONFIRMED state requested
      if (status === "CONFIRMED") {
        for (const item of items) {
          const product = productMap.get(item.productId);
          if (!product || product.currentStock < item.quantity) {
            throw new AppError(`Insufficient stock for product: ${product?.name || "Unknown"} (SKU: ${product?.sku || "N/A"}). Current: ${product?.currentStock || 0}, Requested: ${item.quantity}`, 400);
          }
        }
      }

      // Create Challan Header
      const totalQty = items.reduce((acc, curr) => acc + curr.quantity, 0);
      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          status,
          totalQuantity: totalQty,
          createdById
        }
      });

      // Prepare items and snapshots
      const challanItemsData = items.map((item) => {
        const product = productMap.get(item.productId)!;
        const subtotal = new Decimal(product.unitPrice.toString()).mul(item.quantity);
        return {
          challanId: challan.id,
          productId: item.productId,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          quantity: item.quantity,
          subtotal
        };
      });

      // Insert ChallanItems
      await tx.challanItem.createMany({ data: challanItemsData });

      // If status is CONFIRMED, execute stock updates
      if (status === "CONFIRMED") {
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "OUT",
              reason: `Sales Challan Confirmation: ${challanNumber}`,
              createdById
            }
          });
        }
      }

      return challan;
    });

    res.status(201).json({ success: true, challan: result });
  } catch (error) {
    next(error);
  }
});

// PUT update challan status (Draft -> Confirmed -> Cancelled)
router.put("/:id/status", authMiddleware, roleMiddleware(["ADMIN", "SALES", "ACCOUNTS"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const challanId = req.params.id as string;
    const { status } = req.body;
    const createdById = (req.user?.id || "") as string;

    if (!status || !["Draft", "Confirmed", "Cancelled"].includes(status)) {
      return next(new AppError("Invalid status value", 400));
    }

    const uppercaseStatus = status.toUpperCase();

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true }
      }) as any;

      if (!challan) {
        throw new AppError("Challan not found", 404);
      }

      if (challan.status === uppercaseStatus) {
        return challan;
      }

      const previousStatus = challan.status;

      // Update status
      const updatedChallan = await tx.challan.update({
        where: { id: challanId },
        data: { status: uppercaseStatus as any }
      });

      // If transition to CONFIRMED, deduct stock
      if (uppercaseStatus === "CONFIRMED" && previousStatus !== "CONFIRMED") {
        const productIds = challan.items.map((i: any) => i.productId);
        const dbProducts = await tx.product.findMany({
          where: { id: { in: productIds } }
        });
        const productMap = new Map<string, Product>(dbProducts.map((p) => [p.id, p]));

        for (const item of challan.items) {
          const product = productMap.get(item.productId);
          if (!product || product.currentStock < item.quantity) {
            throw new AppError(`Insufficient stock for product: ${product?.name || "Unknown"} (SKU: ${product?.sku || "N/A"})`, 400);
          }
        }

        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "OUT",
              reason: `Sales Challan Confirmation: ${challan.challanNumber}`,
              createdById
            }
          });
        }
      }

      // If transition to CANCELLED from CONFIRMED, return inventory stock
      if (uppercaseStatus === "CANCELLED" && previousStatus === "CONFIRMED") {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "IN",
              reason: `Sales Challan Cancelled: ${challan.challanNumber}`,
              createdById
            }
          });
        }
      }

      return updatedChallan;
    });

    res.status(200).json({ success: true, challan: result });
  } catch (error) {
    next(error);
  }
});

// Confirm Challan (DRAFT -> CONFIRMED transition)
router.post("/:id/confirm", authMiddleware, roleMiddleware(["ADMIN", "SALES"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const challanId = req.params.id as string;
    const createdById = (req.user?.id || "") as string;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true }
      }) as any;

      if (!challan) {
        throw new AppError("Challan not found", 404);
      }

      if (challan.status !== "DRAFT") {
        throw new AppError(`Cannot confirm a challan in ${challan.status} status`, 400);
      }

      // Check stock sufficiency for all items
      const productIds = challan.items.map((i: any) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } }
      });
      const productMap = new Map<string, Product>(dbProducts.map((p) => [p.id, p]));

      for (const item of challan.items) {
        const product = productMap.get(item.productId);
        if (!product || product.currentStock < item.quantity) {
          throw new AppError(`Insufficient stock for product: ${product?.name || "Unknown"} (SKU: ${product?.sku || "N/A"}). Current: ${product?.currentStock || 0}, Requested: ${item.quantity}`, 400);
        }
      }

      // Perform stock updates
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: "OUT",
            reason: `Sales Challan Confirmation: ${challan.challanNumber}`,
            createdById
          }
        });
      }

      // Update Challan Status
      const updatedChallan = await tx.challan.update({
        where: { id: challanId },
        data: { status: "CONFIRMED" }
      });

      return updatedChallan;
    });

    res.status(200).json({ success: true, challan: result });
  } catch (error) {
    next(error);
  }
});

// Cancel Challan (DRAFT -> CANCELLED or CONFIRMED -> CANCELLED transitions)
router.post("/:id/cancel", authMiddleware, roleMiddleware(["ADMIN", "SALES"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const challanId = req.params.id as string;
    const createdById = (req.user?.id || "") as string;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true }
      }) as any;

      if (!challan) {
        throw new AppError("Challan not found", 404);
      }

      if (challan.status === "CANCELLED") {
        throw new AppError("Challan is already cancelled", 400);
      }

      const previousStatus = challan.status;

      // Update status
      const updatedChallan = await tx.challan.update({
        where: { id: challanId },
        data: { status: "CANCELLED" }
      });

      // If previously CONFIRMED, return inventory stock
      if (previousStatus === "CONFIRMED") {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "IN",
              reason: `Sales Challan Cancelled: ${challan.challanNumber}`,
              createdById
            }
          });
        }
      }

      return updatedChallan;
    });

    res.status(200).json({ success: true, challan: result });
  } catch (error) {
    next(error);
  }
});

// List Challans
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          items: true,
          createdBy: { select: { name: true } }
        }
      }),
      prisma.challan.count()
    ]);

    res.status(200).json({
      success: true,
      data: challans,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get Single Challan details with snapshot items
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const challanId = req.params.id as string;
    const challan = await prisma.challan.findUnique({
      where: { id: challanId },
      include: {
        customer: true,
        items: true,
        invoice: true
      }
    });

    if (!challan) {
      return next(new AppError("Challan not found", 404));
    }

    res.status(200).json({ success: true, challan });
  } catch (error) {
    next(error);
  }
});

export default router;
