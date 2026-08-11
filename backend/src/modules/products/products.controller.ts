import { Router } from "express";
import prisma from "../../config/db";
import { authMiddleware, roleMiddleware, AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unitPrice: z.number().positive(),
  currentStock: z.number().int().nonnegative().default(0),
  minStockQty: z.number().int().nonnegative().default(10),
  location: z.string().min(1),
  imageUrl: z.string().optional().nullable()
});

const stockAdjustmentSchema = z.object({
  quantity: z.number().int().positive(),
  type: z.enum(["IN", "OUT"]),
  reason: z.string().min(1)
});

// Create Product
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "WAREHOUSE"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parse = productSchema.safeParse(req.body);
    if (!parse.success) {
      console.error("PRODUCT CREATION VALIDATION FAILED:", parse.error.format());
      return next(new AppError("Validation failed: " + JSON.stringify(parse.error.format()), 400));
    }

    const product = await prisma.product.create({ data: parse.data });

    // Seed stock movement if starting stock > 0
    if (product.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          type: "IN",
          reason: "Initial stock load",
          createdById: req.user?.id || ""
        }
      });
    }

    res.status(201).json({ success: true, product });
  } catch (error: any) {
    if (error.code === "P2002") {
      return next(new AppError("Product SKU already exists", 400));
    }
    next(error);
  }
});

// Edit Product
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "WAREHOUSE"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parse = productSchema.partial().safeParse(req.body);
    if (!parse.success) {
      console.error("PRODUCT UPDATE VALIDATION FAILED:", parse.error.format());
      return next(new AppError("Validation failed: " + JSON.stringify(parse.error.format()), 400));
    }

    const productId = req.params.id as string;
    // currentStock cannot be directly changed here. Must use manual stock adjustment or challan.
    const { currentStock, ...updateData } = parse.data;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// Manual Stock Adjustment (IN / OUT)
router.post("/:id/stock", authMiddleware, roleMiddleware(["ADMIN", "WAREHOUSE"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parse = stockAdjustmentSchema.safeParse(req.body);
    if (!parse.success) {
      return next(new AppError("Validation failed", 400));
    }

    const { quantity, type, reason } = parse.data;
    const productId = req.params.id as string;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      let newStock = product.currentStock;
      if (type === "IN") {
        newStock += quantity;
      } else {
        newStock -= quantity;
        if (newStock < 0) {
          throw new AppError("Stock cannot drop below zero", 400);
        }
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          type,
          reason,
          createdById: (req.user?.id || "") as string
        }
      });

      return { updatedProduct, movement };
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Query / Search / Paginate Products
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.q as string) || "";
    const category = (req.query.category as string) || "";
    const lowStock = req.query.lowStock === "true";
    const skip = (page - 1) * limit;

    const queryConditions: any = { AND: [] };

    if (search) {
      queryConditions.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } }
        ]
      });
    }

    if (category && category !== "all") {
      queryConditions.AND.push({ category });
    }

    const where = queryConditions.AND.length > 0 ? queryConditions : {};

    const [dbProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" }
      }),
      prisma.product.count({ where })
    ]);

    // Apply low stock threshold filtering post-query if requested
    let filteredProducts = dbProducts;
    if (lowStock) {
      filteredProducts = dbProducts.filter(p => p.currentStock <= p.minStockQty);
    }

    // Map keys to match frontend expectations (minStockAlert camelCase)
    const frontendMapped = filteredProducts.map((p: any) => ({
      ...p,
      minStockAlert: p.minStockQty
    }));

    res.status(200).json({
      success: true,
      data: frontendMapped,
      total: total
    });
  } catch (error) {
    next(error);
  }
});

// Get Stock Movements for Product
router.get("/:id/stock-movements", authMiddleware, async (req, res, next) => {
  try {
    const productId = req.params.id as string;
    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { timestamp: "desc" },
      include: { createdBy: { select: { name: true, email: true } } }
    });
    res.status(200).json({ success: true, movements });
  } catch (error) {
    next(error);
  }
});

// Get Single Product Details
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const productId = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return next(new AppError("Product not found", 404));
    }
    const frontendMapped = {
      ...product,
      minStockAlert: product.minStockQty
    };
    res.status(200).json({ success: true, product: frontendMapped });
  } catch (error) {
    next(error);
  }
});

// Delete Product
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN", "WAREHOUSE"]), async (req, res, next) => {
  try {
    const productId = req.params.id as string;
    
    await prisma.$transaction(async (tx) => {
      // Delete stock movements
      await tx.stockMovement.deleteMany({
        where: { productId }
      });

      // Clear/Delete any ChallanItem or InvoiceItem references to prevent database foreign key constraint errors
      await tx.challanItem.deleteMany({
        where: { productId }
      });
      await tx.invoiceItem.deleteMany({
        where: { productId }
      });

      // Delete the product
      await tx.product.delete({
        where: { id: productId }
      });
    });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
