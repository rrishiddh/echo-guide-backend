import mongoose, { Schema } from "mongoose";
import { IListing, TourCategory, ListingStatus } from "./listing.interface";

const listingSchema = new Schema<IListing>(
  {
    guideId: {
      type: String,
      ref: "User",
      required: [true, "Guide ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [50, "Description must be at least 50 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    itinerary: {
      type: String,
      required: [true, "Itinerary is required"],
      trim: true,
      minlength: [20, "Itinerary must be at least 20 characters"],
      maxlength: [3000, "Itinerary cannot exceed 3000 characters"],
    },
    tourFee: {
      type: Number,
      required: [true, "Tour fee is required"],
      min: [0, "Tour fee cannot be negative"],
      max: [100000, "Tour fee seems unreasonably high"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 hour"],
      max: [240, "Duration cannot exceed 240 hours (10 days)"],
    },
    meetingPoint: {
      type: String,
      required: [true, "Meeting point is required"],
      trim: true,
      maxlength: [200, "Meeting point cannot exceed 200 characters"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Max group size is required"],
      min: [1, "Max group size must be at least 1"],
      max: [50, "Max group size cannot exceed 50"],
    },
    category: {
      type: [String],
      enum: Object.values(TourCategory),
      required: [true, "At least one category is required"],
      validate: {
        validator: function (value: string[]) {
          return value && value.length > 0 && value.length <= 5;
        },
        message: "Must have 1-5 categories",
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (value: string[]) {
          return value.length <= 10;
        },
        message: "Cannot have more than 10 images",
      },
    },
    status: {
      type: String,
      enum: Object.values(ListingStatus),
      default: ListingStatus.ACTIVE,
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

listingSchema.index({ guideId: 1, status: 1 });
listingSchema.index({ category: 1, isActive: 1 });
listingSchema.index({ city: 1, country: 1 });
listingSchema.index({ tourFee: 1 });
listingSchema.index({ averageRating: -1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ title: "text", description: "text" });

listingSchema.virtual("guide", {
  ref: "User",
  localField: "guideId",
  foreignField: "_id",
  justOne: true,
});

listingSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "listingId",
});

listingSchema.statics.findActive = function () {
  return this.find({ isActive: true, status: ListingStatus.ACTIVE });
};

listingSchema.statics.findByGuide = function (guideId: string) {
  return this.find({ guideId });
};

const Listing = mongoose.model<IListing>("Listing", listingSchema);

export default Listing;
