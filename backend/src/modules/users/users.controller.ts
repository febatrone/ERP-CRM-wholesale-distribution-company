import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { authMiddleware, roleMiddleware, AuthenticatedRequest } from "../../middleware/auth";
import { z } from "zod";
import { Role } from "@prisma/client";

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.string(),
  department: z.string().optional().nullable(),
  avatar: z.string().optional().nullable()
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  department: z.string().optional().nullable(),
  avatar: z.string().optional().nullable()
});

const resetPasswordSchema = z.object({
  password: z.string().min(6)
});

const mapUserToFrontend = (user: any) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role.charAt(0) + user.role.slice(1).toLowerCase(),
  department: user.department || "",
  avatar: user.avatar || ""
});

// 1. Get All Users (Restricted to ADMIN)
router.get("/", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res, next) => {
  try {
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(dbUsers.map(mapUserToFrontend));
  } catch (error) {
    next(error);
  }
});

// 2. Create User (Restricted to ADMIN)
router.post("/", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res, next) => {
  try {
    const parse = createUserSchema.safeParse(req.body);
    if (!parse.success) {
      console.error("USER CREATION VALIDATION FAILED:", parse.error.format());
      throw new AppError("Invalid input fields: " + JSON.stringify(parse.error.format()), 400);
    }

    const { email, password, name, role, department, avatar } = parse.data;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("Email is already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const dbRole = role.toUpperCase() as Role;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: dbRole,
        department,
        avatar
      }
    });

    res.status(201).json(mapUserToFrontend(user));
  } catch (error) {
    next(error);
  }
});

// 3. Update User (Restricted to ADMIN)
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res, next) => {
  try {
    const parse = updateUserSchema.safeParse(req.body);
    if (!parse.success) {
      console.error("USER UPDATE VALIDATION FAILED:", parse.error.format());
      throw new AppError("Invalid input fields: " + JSON.stringify(parse.error.format()), 400);
    }

    const userId = req.params.id as string;
    const { email, name, role, department, avatar } = parse.data;

    // Check email unique if changing email
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        throw new AppError("Email is already in use by another user", 400);
      }
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role.toUpperCase() as Role;
    if (department !== undefined) updateData.department = department;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.status(200).json(mapUserToFrontend(user));
  } catch (error) {
    next(error);
  }
});

// 4. Delete User (Restricted to ADMIN, preventing self-deletion)
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN"]), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.params.id as string;

    if (userId === req.user?.id) {
      throw new AppError("You cannot delete your own account", 400);
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// 5. Reset Password (Restricted to ADMIN)
router.put("/:id/password", authMiddleware, roleMiddleware(["ADMIN"]), async (req, res, next) => {
  try {
    const parse = resetPasswordSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError("Password must be at least 6 characters long", 400);
    }

    const userId = req.params.id as string;
    const { password } = parse.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
});

export default router;
