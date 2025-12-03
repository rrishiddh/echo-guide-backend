import { z } from "zod";
import { BookingStatus, PaymentStatus } from "./booking.interface";


export const createBookingSchema = z.object({
  listingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid listing ID format"),
  bookingDate: z
    .string()
    .datetime("Invalid date format")
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), {
      message: "Booking date must be in the future",
    }),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  numberOfPeople: z
    .number()
    .int("Number of people must be an integer")
    .min(1, "Number of people must be at least 1")
    .max(50, "Number of people cannot exceed 50"),
  specialRequests: z
    .string()
    .max(500, "Special requests cannot exceed 500 characters")
    .optional(),
});


export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus, {
    errorMap: () => ({ message: "Invalid booking status" }),
  }),
  rejectionReason: z
    .string()
    .max(500, "Rejection reason cannot exceed 500 characters")
    .optional(),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z
    .string()
    .min(10, "Cancellation reason must be at least 10 characters")
    .max(500, "Cancellation reason cannot exceed 500 characters"),
});


export const bookingQuerySchema = z.object({
  touristId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid tourist ID format")
    .optional(),
  guideId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid guide ID format")
    .optional(),
  listingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid listing ID format")
    .optional(),
  status: z
    .nativeEnum(BookingStatus)
    .optional(),
  paymentStatus: z
    .nativeEnum(PaymentStatus)
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
  sortBy: z
    .string()
    .regex(
      /^-?(bookingDate|createdAt|totalPrice|status)$/,
      "Invalid sort field"
    )
    .optional(),
});


export const bookingIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID format"),
});


export const createPaymentIntentSchema = z.object({
  bookingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID format"),
});


export const confirmPaymentSchema = z.object({
  paymentIntentId: z
    .string()
    .min(1, "Payment intent ID is required"),
});