import { z } from "zod";
import { UserRole } from "../auth/auth.interface";


export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim()
    .optional(),
  bio: z
    .string()
    .max(500, "Bio cannot exceed 500 characters")
    .optional(),
  languagesSpoken: z
    .array(z.string())
    .max(10, "Cannot specify more than 10 languages")
    .optional(),
  profilePic: z
    .string()
    .url("Profile picture must be a valid URL")
    .optional(),
  
  expertise: z
    .array(z.string())
    .min(1, "At least one expertise is required")
    .max(20, "Cannot specify more than 20 expertise areas")
    .optional(),
  dailyRate: z
    .number()
    .positive("Daily rate must be positive")
    .max(10000, "Daily rate seems unreasonably high")
    .optional(),
  
  travelPreferences: z
    .array(z.string())
    .max(20, "Cannot specify more than 20 travel preferences")
    .optional(),
});


export const userQuerySchema = z.object({
  role: z
    .nativeEnum(UserRole)
    .optional(),
  isVerified: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  search: z
    .string()
    .max(100, "Search query too long")
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 10, 100))
    .optional(),
  sortBy: z
    .string()
    .regex(/^-?(name|email|createdAt|dailyRate)$/, "Invalid sort field")
    .optional(),
});


export const userIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});


export const toggleUserStatusSchema = z.object({
  isActive: z
    .boolean()
    .refine((v) => typeof v === "boolean", "isActive must be a boolean"),
});



export const verifyUserSchema = z.object({
  isVerified: z
    .boolean()
    .refine((v) => typeof v === "boolean", "isVerified must be a boolean"),
});



export const changeRoleSchema = z.object({
  role: z.nativeEnum(UserRole)
    .refine(
      (v) => Object.values(UserRole).includes(v),
      "Role must be tourist, guide, or admin"
    ),
});