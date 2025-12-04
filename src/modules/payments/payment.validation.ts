import { z } from "zod";
import { PaymentStatus, TransactionType } from "./payment.interface";


export const createPaymentIntentSchema = z.object({
  bookingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID format"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount too large")
    .optional(),
});


export const confirmPaymentSchema = z.object({
  paymentIntentId: z
    .string()
    .min(1, "Payment intent ID is required"),
  paymentMethodId: z
    .string()
    .optional(),
});


export const refundPaymentSchema = z.object({
  amount: z
    .number()
    .positive("Refund amount must be positive")
    .optional(),
  reason: z
    .string()
    .min(10, "Refund reason must be at least 10 characters")
    .max(500, "Refund reason cannot exceed 500 characters")
    .trim(),
});


export const paymentQuerySchema = z.object({
  touristId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid tourist ID format")
    .optional(),
  guideId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid guide ID format")
    .optional(),
  bookingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID format")
    .optional(),
  status: z
    .nativeEnum(PaymentStatus)
    .optional(),
  transactionType: z
    .nativeEnum(TransactionType)
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
  minAmount: z
    .string()
    .transform((val) => parseFloat(val))
    .optional(),
  maxAmount: z
    .string()
    .transform((val) => parseFloat(val))
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
      /^-?(amount|createdAt|processedAt|status)$/,
      "Invalid sort field"
    )
    .optional(),
});


export const paymentIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid payment ID format"),
});


export const payoutRequestSchema = z.object({
  amount: z
    .number()
    .positive("Payout amount must be positive")
    .max(1000000, "Amount too large"),
  method: z
    .string()
    .min(1, "Payout method is required"),
});


export const webhookSignatureSchema = z.object({
  signature: z.string().min(1, "Webhook signature is required"),
});