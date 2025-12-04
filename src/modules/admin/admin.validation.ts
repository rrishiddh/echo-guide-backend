import { z } from "zod";
import { UserRole } from "../auth/auth.interface";
import { ListingStatus } from "../listings/listing.interface";
import { BookingStatus } from "../bookings/booking.interface";


export const dashboardQuerySchema = z.object({
  startDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  period: z
    .enum(["today", "week", "month", "year", "all"])
    .optional(),
});


export const bulkActionSchema = z.object({
  ids: z
    .array(
      z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
    )
    .min(1, "At least one ID is required")
    .max(100, "Cannot process more than 100 items at once"),
  action: z
    .enum(["activate", "deactivate", "delete", "verify", "unverify"]),
});


export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
 role: z.nativeEnum(UserRole)
  .refine((val) => Object.values(UserRole).includes(val), {
    message: "Role must be tourist, guide, or admin",
  }),

  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  
  expertise: z
    .array(z.string())
    .optional(),
  dailyRate: z
    .number()
    .positive()
    .optional(),
});


export const updateListingStatusSchema = z.object({
  status: z.nativeEnum(ListingStatus),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters")
    .optional(),
});


export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters")
    .optional(),
});


export const systemSettingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  allowRegistration: z.boolean().optional(),
  allowBookings: z.boolean().optional(),
  platformFeePercentage: z
    .number()
    .min(0, "Fee cannot be negative")
    .max(100, "Fee cannot exceed 100%")
    .optional(),
  minBookingAmount: z
    .number()
    .min(0, "Amount cannot be negative")
    .optional(),
  maxBookingAmount: z
    .number()
    .positive()
    .optional(),
});


export const sendNotificationSchema = z.object({
  recipientType: z.enum(["all", "tourists", "guides", "specific"]),
  recipientIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/))
    .optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message cannot exceed 500 characters"),
  type: z.enum(["info", "warning", "success", "error"]).optional(),
});


export const activityLogQuerySchema = z.object({
  userId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID")
    .optional(),
  action: z
    .string()
    .max(50)
    .optional(),
  entityType: z
    .enum(["user", "listing", "booking", "payment", "review"])
    .optional(),
  startDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 10, 100))
    .optional(),
});