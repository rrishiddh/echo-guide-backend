import { z } from "zod";
import { TourCategory, ListingStatus } from "./listing.interface";


export const createListingSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(150, "Title cannot exceed 150 characters")
    .trim(),
  description: z
    .string()
    .min(1, "Description must be at least 50 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim(),
  itinerary: z
    .string()
    .min(20, "Itinerary must be at least 20 characters")
    .max(3000, "Itinerary cannot exceed 3000 characters")
    .trim(),
  tourFee: z
    .number()
    .min(0, "Tour fee cannot be negative")
    .max(100000, "Tour fee seems unreasonably high"),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 hour")
    .max(240, "Duration cannot exceed 240 hours"),
  meetingPoint: z
    .string()
    .min(5, "Meeting point must be at least 5 characters")
    .max(200, "Meeting point cannot exceed 200 characters")
    .trim(),
  maxGroupSize: z
    .number()
    .int("Max group size must be an integer")
    .min(1, "Max group size must be at least 1")
    .max(50, "Max group size cannot exceed 50"),
  category: z
    .array(z.nativeEnum(TourCategory))
    .min(1, "At least one category is required")
    .max(5, "Cannot have more than 5 categories"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City cannot exceed 100 characters")
    .trim(),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country cannot exceed 100 characters")
    .trim(),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .max(10, "Cannot have more than 10 images")
    .optional(),
});


export const updateListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title must be at least 10 characters")
    .max(150, "Title cannot exceed 150 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, "Description must be at least 50 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim()
    .optional(),
  itinerary: z
    .string()
    .min(1, "Itinerary must be at least 20 characters")
    .max(3000, "Itinerary cannot exceed 3000 characters")
    .trim()
    .optional(),
  tourFee: z
    .number()
    .min(0, "Tour fee cannot be negative")
    .max(100000, "Tour fee seems unreasonably high")
    .optional(),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 hour")
    .max(240, "Duration cannot exceed 240 hours")
    .optional(),
  meetingPoint: z
    .string()
    .min(1, "Meeting point must be at least 5 characters")
    .max(200, "Meeting point cannot exceed 200 characters")
    .trim()
    .optional(),
  maxGroupSize: z
    .number()
    .int("Max group size must be an integer")
    .min(1, "Max group size must be at least 1")
    .max(50, "Max group size cannot exceed 50")
    .optional(),
  category: z
    .array(z.nativeEnum(TourCategory))
    .min(1, "At least one category is required")
    .max(5, "Cannot have more than 5 categories")
    .optional(),
  city: z
    .string()
    .min(1, "City must be at least 2 characters")
    .max(100, "City cannot exceed 100 characters")
    .trim()
    .optional(),
  country: z
    .string()
    .min(1, "Country must be at least 2 characters")
    .max(100, "Country cannot exceed 100 characters")
    .trim()
    .optional(),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .max(10, "Cannot have more than 10 images")
    .optional(),
  status: z
    .nativeEnum(ListingStatus)
    .optional(),
});


export const listingQuerySchema = z.object({
  guideId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid guide ID format")
    .optional(),
  category: z
    .string()
    .transform((val) => val.split(","))
    .optional(),
  minPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .optional(),
  maxPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .optional(),
  minDuration: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  maxDuration: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  city: z
    .string()
    .max(100, "City name too long")
    .optional(),
  country: z
    .string()
    .max(100, "Country name too long")
    .optional(),
  search: z
    .string()
    .max(100, "Search query too long")
    .optional(),
  status: z
    .nativeEnum(ListingStatus)
    .optional(),
  isActive: z
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
      /^-?(title|tourFee|duration|averageRating|createdAt|totalBookings)$/,
      "Invalid sort field"
    )
    .optional(),
});


export const listingIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid listing ID format"),
});


export const uploadImagesSchema = z.object({
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image is required")
    .max(10, "Cannot upload more than 10 images"),
});

export const deleteImageSchema = z.object({
  imageUrl: z
    .string()
    .url("Image URL must be valid"),
});