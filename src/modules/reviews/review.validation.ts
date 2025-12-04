import { z } from "zod";


export const createReviewSchema = z.object({
  listingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid listing ID format"),
  bookingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID format"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment cannot exceed 1000 characters")
    .trim(),
  guideRating: z
    .number()
    .int("Guide rating must be an integer")
    .min(1, "Guide rating must be at least 1")
    .max(5, "Guide rating cannot exceed 5")
    .optional(),
  communicationRating: z
    .number()
    .int("Communication rating must be an integer")
    .min(1, "Communication rating must be at least 1")
    .max(5, "Communication rating cannot exceed 5")
    .optional(),
  valueRating: z
    .number()
    .int("Value rating must be an integer")
    .min(1, "Value rating must be at least 1")
    .max(5, "Value rating cannot exceed 5")
    .optional(),
  experienceRating: z
    .number()
    .int("Experience rating must be an integer")
    .min(1, "Experience rating must be at least 1")
    .max(5, "Experience rating cannot exceed 5")
    .optional(),
});


export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .optional(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment cannot exceed 1000 characters")
    .trim()
    .optional(),
  guideRating: z
    .number()
    .int("Guide rating must be an integer")
    .min(1, "Guide rating must be at least 1")
    .max(5, "Guide rating cannot exceed 5")
    .optional(),
  communicationRating: z
    .number()
    .int("Communication rating must be an integer")
    .min(1, "Communication rating must be at least 1")
    .max(5, "Communication rating cannot exceed 5")
    .optional(),
  valueRating: z
    .number()
    .int("Value rating must be an integer")
    .min(1, "Value rating must be at least 1")
    .max(5, "Value rating cannot exceed 5")
    .optional(),
  experienceRating: z
    .number()
    .int("Experience rating must be an integer")
    .min(1, "Experience rating must be at least 1")
    .max(5, "Experience rating cannot exceed 5")
    .optional(),
});


export const reviewQuerySchema = z.object({
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
  minRating: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  maxRating: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  isVerified: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  isHidden: z
    .string()
    .transform((val) => val === "true")
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
      /^-?(rating|createdAt|helpful)$/,
      "Invalid sort field"
    )
    .optional(),
});


export const reviewIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid review ID format"),
});


export const reportReviewSchema = z.object({
  reason: z
    .string()
    .min(10, "Report reason must be at least 10 characters")
    .max(500, "Report reason cannot exceed 500 characters")
    .trim(),
});


export const markHelpfulSchema = z.object({
  helpful: z
    .boolean()
    .refine((val) => typeof val === "boolean", {
      message: "helpful must be a boolean",
    }),
});;


export const hideReviewSchema = z.object({
  isHidden: z
    .boolean()
    .refine((val) => typeof val === "boolean", {
      message: "isHidden must be a boolean",
    }),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters")
    .optional(),
});