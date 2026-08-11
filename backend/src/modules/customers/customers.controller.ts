import { Router } from "express";
import prisma from "../../config/db";
import { authMiddleware, roleMiddleware, AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { z } from "zod";

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10),
  email: z.string().email(),
  businessName: z.string().min(1),
  gstNumber: z.string().optional().nullable(),
  type: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]),
  address: z.string().min(1),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).default("LEAD"),
  followUpDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable()
});

// Create Customer
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "SALES"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parse = customerSchema.safeParse(req.body);
    if (!parse.success) {
      return next(new AppError("Validation failed", 400));
    }

    const customer = await prisma.customer.create({
      data: {
        ...parse.data,
        followUpDate: parse.data.followUpDate ? new Date(parse.data.followUpDate) : null
      }
    });

    res.status(201).json({ success: true, customer });
  } catch (error: any) {
    if (error.code === "P2002") {
      return next(new AppError("Email already registered", 400));
    }
    next(error);
  }
});

// Update Customer
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "SALES"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parse = customerSchema.partial().safeParse(req.body);
    if (!parse.success) {
      return next(new AppError("Validation failed", 400));
    }

    const customerId = req.params.id as string;
    const updateData: any = { ...parse.data };
    if (parse.data.followUpDate) {
      updateData.followUpDate = new Date(parse.data.followUpDate);
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: updateData
    });

    res.status(200).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
});

// Query / Search / Paginate Customers
router.get("/", authMiddleware, roleMiddleware(["ADMIN", "SALES", "ACCOUNTS"]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const skip = (page - 1) * limit;

    const queryConditions = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { businessName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } }
      ]
    } : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: queryConditions,
        skip,
        take: limit,
        orderBy: { name: "asc" }
      }),
      prisma.customer.count({ where: queryConditions })
    ]);

    res.status(200).json({
      success: true,
      data: customers,
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

// Get Single Customer Details
router.get("/:id", authMiddleware, roleMiddleware(["ADMIN", "SALES", "ACCOUNTS"]), async (req, res, next) => {
  try {
    const customerId = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { followUps: true }
    });

    if (!customer) {
      return next(new AppError("Customer not found", 404));
    }

    res.status(200).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
});

// Delete Customer
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res, next) => {
  try {
    const customerId = req.params.id as string;
    await prisma.customer.delete({ where: { id: customerId } });
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Get Customer Followups
router.get("/:id/followups", authMiddleware, roleMiddleware(["ADMIN", "SALES", "ACCOUNTS"]), async (req, res, next) => {
  try {
    const customerId = req.params.id as string;
    const followUps = await prisma.customerFollowUp.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json({ success: true, followUps });
  } catch (error) {
    next(error);
  }
});

// Add Followup Note (Append-only history)
router.post("/:id/followups", authMiddleware, roleMiddleware(["ADMIN", "SALES"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const customerId = req.params.id as string;
    const { notes } = req.body;
    if (!notes || typeof notes !== "string" || notes.trim() === "") {
      return next(new AppError("Followup notes content required", 400));
    }

    const followUp = await prisma.customerFollowUp.create({
      data: {
        customerId,
        notes: notes.trim(),
        createdBy: req.user?.email || "System"
      }
    });

    res.status(201).json({ success: true, followUp });
  } catch (error) {
    next(error);
  }
});

export default router;
