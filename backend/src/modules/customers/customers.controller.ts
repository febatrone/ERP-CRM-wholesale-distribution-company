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
  notes: z.string().optional().nullable(),
  
  // Advanced CRM Pipeline & Financial Fields
  pipelineStage: z.string().optional().default("Inquiry"),
  dealValue: z.number().optional().default(0),
  winProbability: z.number().int().optional().default(0),
  expectedCloseDate: z.string().datetime().optional().nullable(),
  assignedRep: z.string().optional().nullable(),
  leadSource: z.string().optional().nullable(),
  creditLimit: z.number().optional().default(0),
  outstandingBalance: z.number().optional().default(0)
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
        followUpDate: parse.data.followUpDate ? new Date(parse.data.followUpDate) : null,
        expectedCloseDate: parse.data.expectedCloseDate ? new Date(parse.data.expectedCloseDate) : null
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
    if (parse.data.expectedCloseDate) {
      updateData.expectedCloseDate = new Date(parse.data.expectedCloseDate);
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

// Confirm Stage update
router.patch("/:id/stage", authMiddleware, roleMiddleware(["ADMIN", "SALES"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const customerId = req.params.id as string;
    const { pipelineStage } = req.body;
    if (!pipelineStage) {
      return next(new AppError("pipelineStage value required", 400));
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: { pipelineStage }
    });

    res.status(200).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
});

// GET CRM Analytics overview stats
router.get("/analytics", authMiddleware, roleMiddleware(["ADMIN", "SALES", "ACCOUNTS"]), async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany();

    const totalPipelineValue = customers.reduce((sum, c) => sum + Number(c.dealValue), 0);
    const weightedPipelineValue = customers.reduce((sum, c) => sum + (Number(c.dealValue) * (c.winProbability / 100)), 0);

    const stagesCount: Record<string, number> = {};
    const stagesValue: Record<string, number> = {};

    customers.forEach((c) => {
      const stage = c.pipelineStage || "Inquiry";
      stagesCount[stage] = (stagesCount[stage] || 0) + 1;
      stagesValue[stage] = (stagesValue[stage] || 0) + Number(c.dealValue);
    });

    const wonCount = customers.filter(c => c.pipelineStage === "Closed Won").length;
    const closedCount = customers.filter(c => c.pipelineStage === "Closed Won" || c.pipelineStage === "Closed Lost").length;
    const winRate = closedCount > 0 ? (wonCount / closedCount) * 100 : 0;

    res.status(200).json({
      success: true,
      totalPipelineValue,
      weightedPipelineValue,
      stagesCount,
      stagesValue,
      winRate,
      totalCustomers: customers.length
    });
  } catch (error) {
    next(error);
  }
});

// Query / Search / Paginate Customers
router.get("/", authMiddleware, roleMiddleware(["ADMIN", "SALES", "ACCOUNTS"]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.q as string) || "";
    const status = (req.query.status as string) || "";
    const type = (req.query.type as string) || "";
    const skip = (page - 1) * limit;

    const queryConditions: any = { AND: [] };

    if (search) {
      queryConditions.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { businessName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } }
        ]
      });
    }

    if (status && status !== "all") {
      queryConditions.AND.push({ status: status.toUpperCase() });
    }

    if (type && type !== "all") {
      queryConditions.AND.push({ type: type.toUpperCase() });
    }

    const where = queryConditions.AND.length > 0 ? queryConditions : {};

    const [dbCustomers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" }
      }),
      prisma.customer.count({ where })
    ]);

    // Map keys to match frontend expectation (camelCase matching database)
    const frontendMapped = dbCustomers.map((c: any) => ({
      ...c,
      customerType: c.type,
      nextFollowUpDate: c.followUpDate
    }));

    res.status(200).json({
      success: true,
      data: frontendMapped,
      total
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
    const { note, date } = req.body;
    if (!note || typeof note !== "string" || note.trim() === "") {
      return next(new AppError("Followup note content required", 400));
    }

    const result = await prisma.$transaction(async (tx) => {
      const followUp = await tx.customerFollowUp.create({
        data: {
          customerId,
          notes: note.trim(),
          createdBy: req.user?.name || "System"
        }
      });

      if (date) {
        await tx.customer.update({
          where: { id: customerId },
          data: { followUpDate: new Date(date) }
        });
      }

      const updated = await tx.customer.findUnique({
        where: { id: customerId },
        include: { followUps: true }
      });

      return updated;
    });

    res.status(201).json({ success: true, customer: result });
  } catch (error) {
    next(error);
  }
});

export default router;
