import mongoose, { Schema } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema = new Schema<IReview>(
  {
    touristId: {
      type: String,
      ref: "User",
      required: [true, "Tourist ID is required"],
      index: true,
    },
    guideId: {
      type: String,
      ref: "User",
      required: [true, "Guide ID is required"],
      index: true,
    },
    listingId: {
      type: String,
      ref: "Listing",
      required: [true, "Listing ID is required"],
      index: true,
    },
    bookingId: {
      type: String,
      ref: "Booking",
      required: [true, "Booking ID is required"],
      unique: true, 
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    guideRating: {
      type: Number,
      min: [1, "Guide rating must be at least 1"],
      max: [5, "Guide rating cannot exceed 5"],
      default: null,
    },
    communicationRating: {
      type: Number,
      min: [1, "Communication rating must be at least 1"],
      max: [5, "Communication rating cannot exceed 5"],
      default: null,
    },
    valueRating: {
      type: Number,
      min: [1, "Value rating must be at least 1"],
      max: [5, "Value rating cannot exceed 5"],
      default: null,
    },
    experienceRating: {
      type: Number,
      min: [1, "Experience rating must be at least 1"],
      max: [5, "Experience rating cannot exceed 5"],
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: true, 
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
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
}

    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
reviewSchema.index({ listingId: 1, rating: -1 });
reviewSchema.index({ guideId: 1, rating: -1 });
reviewSchema.index({ touristId: 1, createdAt: -1 });
reviewSchema.index({ isVerified: 1, isHidden: 1 });
reviewSchema.index({ createdAt: -1 });

reviewSchema.index({ touristId: 1, bookingId: 1 }, { unique: true });

reviewSchema.virtual("tourist", {
  ref: "User",
  localField: "touristId",
  foreignField: "_id",
  justOne: true,
});

reviewSchema.virtual("guide", {
  ref: "User",
  localField: "guideId",
  foreignField: "_id",
  justOne: true,
});

reviewSchema.virtual("listing", {
  ref: "Listing",
  localField: "listingId",
  foreignField: "_id",
  justOne: true,
});

reviewSchema.virtual("booking", {
  ref: "Booking",
  localField: "bookingId",
  foreignField: "_id",
  justOne: true,
});

reviewSchema.statics.calculateListingRating = async function (listingId: string) {
  const result = await this.aggregate([
    {
      $match: {
        listingId,
        isHidden: false,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { averageRating: 0, totalReviews: 0 };
};

reviewSchema.statics.getRatingDistribution = async function (listingId: string) {
  const distribution = await this.aggregate([
    {
      $match: {
        listingId,
        isHidden: false,
      },
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return distribution.map((item) => ({
    rating: item._id,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));
};

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;