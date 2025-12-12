import httpStatus from "http-status";
import Review from "./review.model";
import Booking from "../bookings/booking.model";
import Listing from "../listings/listing.model";
import User from "../users/user.model";
import ApiError from "../../utils/ApiError";
import { connectDatabase } from "../../config/database";
import {
  ICreateReviewRequest,
  IUpdateReviewRequest,
  IReviewQuery,
  IReviewListResponse,
  IReviewStats,
  IGuideReviewSummary,
} from "./review.interface";
import { logger } from "../../config/logger";
import {
  parsePaginationParams,
  calculatePagination,
} from "../../utils/helpers";
import { BookingStatus } from "../bookings/booking.interface";
import listingService from "../listings/listing.service";


const createReview = async (
  touristId: string,
  payload: ICreateReviewRequest
) => {
  await connectDatabase();
  const booking = await Booking.findById(payload.bookingId);

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.touristId.toString() !== touristId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only review your own bookings"
    );
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review completed bookings"
    );
  }

  const existingReview = await Review.findOne({ bookingId: payload.bookingId });

  if (existingReview) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "You have already reviewed this booking"
    );
  }

  if (booking.listingId.toString() !== payload.listingId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Listing ID does not match booking"
    );
  }

  const review = await Review.create({
    ...payload,
    touristId,
    guideId: booking.guideId,
  });

  await listingService.updateListingRating(payload.listingId, payload.rating);

  await review.populate([
    { path: "tourist", select: "name profilePic" },
    { path: "guide", select: "name profilePic" },
    { path: "listing", select: "title city country" },
  ]);

  logger.info(`New review created: ${review._id} by tourist: ${touristId}`);

  return review;
};


const getReviewById = async (reviewId: string) => {
  await connectDatabase();
  const review = await Review.findById(reviewId).populate([
    { path: "tourist", select: "name profilePic" },
    { path: "guide", select: "name profilePic" },
    { path: "listing", select: "title city country images" },
  ]);

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  return review;
};


const getAllReviews = async (
  query: IReviewQuery
): Promise<IReviewListResponse> => {
  await connectDatabase();
  const {
    touristId,
    guideId,
    listingId,
    minRating,
    maxRating,
    isVerified,
    isHidden,
    page = 1,
    limit = 10,
    sortBy = "-createdAt",
  } = query;

  const filter: any = {};

  if (touristId) {
    filter.touristId = touristId;
  }

  if (guideId) {
    filter.guideId = guideId;
  }

  if (listingId) {
    filter.listingId = listingId;
  }

  if (minRating !== undefined || maxRating !== undefined) {
    filter.rating = {};
    if (minRating !== undefined) {
      filter.rating.$gte = minRating;
    }
    if (maxRating !== undefined) {
      filter.rating.$lte = maxRating;
    }
  }

  if (isVerified !== undefined) {
    filter.isVerified = isVerified;
  }

  if (isHidden !== undefined) {
    filter.isHidden = isHidden;
  }

  const { skip } = parsePaginationParams({ page, limit });

  const sortOrder: any = {};
  if (sortBy.startsWith("-")) {
    sortOrder[sortBy.substring(1)] = -1;
  } else {
    sortOrder[sortBy] = 1;
  }

  const total = await Review.countDocuments(filter);

  const reviews = await Review.find(filter)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .populate([
      { path: "tourist", select: "name profilePic" },
      { path: "guide", select: "name profilePic" },
      { path: "listing", select: "title city country images" },
    ])
    .select("-__v");

  const ratingResult = await Review.aggregate([
    { $match: filter },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
  const averageRating = ratingResult[0]?.avgRating || 0;

  const ratingDistribution = await Review.aggregate([
    { $match: filter },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  const distribution = ratingDistribution.map((item) => ({
    rating: item._id,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  const meta = {
    ...calculatePagination(total, page, limit),
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution: distribution,
  };

  return {
    reviews,
    meta,
  };
};


const getReviewsByListing = async (
  listingId: string,
  query: IReviewQuery
): Promise<IReviewListResponse> => {
  return getAllReviews({ ...query, listingId, isHidden: false });
};


const getReviewsByGuide = async (
  guideId: string,
  query: IReviewQuery
): Promise<IReviewListResponse> => {
  return getAllReviews({ ...query, guideId, isHidden: false });
};

const getReviewsByTourist = async (
  touristId: string,
  query: IReviewQuery
): Promise<IReviewListResponse> => {
  return getAllReviews({ ...query, touristId });
};


const updateReview = async (
  reviewId: string,
  touristId: string,
  payload: IUpdateReviewRequest
) => {
  await connectDatabase();
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.touristId.toString() !== touristId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only update your own reviews"
    );
  }

  const daysSinceCreation =
    (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceCreation > 7) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Reviews can only be edited within 7 days of creation"
    );
  }

  const oldRating = review.rating;
  Object.assign(review, payload);
  review.isEdited = true;
  await review.save();

  if (payload.rating && payload.rating !== oldRating) {
    await listingService.updateListingRating(
      review.listingId.toString(),
      payload.rating
    );
  }

  logger.info(`Review updated: ${reviewId} by tourist: ${touristId}`);

  return review;
};


const deleteReview = async (
  reviewId: string,
  touristId: string
): Promise<void> => {
  await connectDatabase();
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.touristId.toString() !== touristId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only delete your own reviews"
    );
  }

  await Review.findByIdAndDelete(reviewId);

  logger.info(`Review deleted: ${reviewId} by tourist: ${touristId}`);
};


const markReviewHelpful = async (
  reviewId: string,
  helpful: boolean
): Promise<void> => {
  await connectDatabase();
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (helpful) {
    review.helpful += 1;
  } else {
    review.helpful = Math.max(0, review.helpful - 1);
  }

  await review.save();
};


const reportReview = async (
  reviewId: string,
  userId: string,
  reason: string
): Promise<void> => {
  await connectDatabase();
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  review.reportCount += 1;

  if (review.reportCount >= 5) {
    review.isHidden = true;
  }

  await review.save();

  logger.warn(
    `Review reported: ${reviewId} by user: ${userId}. Reason: ${reason}. Report count: ${review.reportCount}`
  );
};


const toggleReviewVisibility = async (
  reviewId: string,
  isHidden: boolean,
  reason?: string
): Promise<void> => {
  await connectDatabase();
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }

  review.isHidden = isHidden;
  await review.save();

  logger.info(
    `Review visibility toggled: ${reviewId} - Hidden: ${isHidden}${reason ? `. Reason: ${reason}` : ""}`
  );
};


const getReviewStats = async (): Promise<IReviewStats> => {
  await connectDatabase();
  const totalReviews = await Review.countDocuments();
  const verifiedReviews = await Review.countDocuments({ isVerified: true });
  const hiddenReviews = await Review.countDocuments({ isHidden: true });

  const avgResult = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
  const averageRating = avgResult[0]?.avgRating || 0;

  const distributionResult = await Review.aggregate([
    { $group: { _id: "$rating", count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  const ratingDistribution = distributionResult.map((item) => ({
    rating: item._id,
    count: item.count,
    percentage:
      totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0,
  }));

  const recentReviews = await Review.find({ isHidden: false })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate([
      { path: "tourist", select: "name profilePic" },
      { path: "guide", select: "name profilePic" },
      { path: "listing", select: "title city country" },
    ]);

  const topRatedListings = await Review.aggregate([
    { $match: { isHidden: false } },
    {
      $group: {
        _id: "$listingId",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
    { $match: { totalReviews: { $gte: 3 } } },
    { $sort: { avgRating: -1, totalReviews: -1 } },
    { $limit: 5 },
  ]);

  const populatedListings = await Listing.populate(topRatedListings, {
    path: "_id",
    select: "title city country images tourFee",
  });

  const topRatedGuides = await Review.aggregate([
    { $match: { isHidden: false } },
    {
      $group: {
        _id: "$guideId",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
    { $match: { totalReviews: { $gte: 3 } } },
    { $sort: { avgRating: -1, totalReviews: -1 } },
    { $limit: 5 },
  ]);

  const populatedGuides = await User.populate(topRatedGuides, {
    path: "_id",
    select: "name email profilePic expertise",
  });

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    verifiedReviews,
    hiddenReviews,
    ratingDistribution,
    recentReviews,
    topRatedListings: populatedListings,
    topRatedGuides: populatedGuides,
  };
};


const getGuideReviewSummary = async (
  guideId: string
): Promise<IGuideReviewSummary> => {
  await connectDatabase();
  const reviews = await Review.find({ guideId, isHidden: false });

  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      averageGuideRating: 0,
      averageCommunicationRating: 0,
      averageValueRating: 0,
      averageExperienceRating: 0,
      ratingDistribution: [],
      recentReviews: [],
    };
  }

  const totals = reviews.reduce(
    (acc, review) => {
      acc.rating += review.rating;
      acc.guideRating += review.guideRating || 0;
      acc.communicationRating += review.communicationRating || 0;
      acc.valueRating += review.valueRating || 0;
      acc.experienceRating += review.experienceRating || 0;
      return acc;
    },
    {
      rating: 0,
      guideRating: 0,
      communicationRating: 0,
      valueRating: 0,
      experienceRating: 0,
    }
  );
  const distributionMap = new Map<number, number>();
  reviews.forEach((review) => {
    const count = distributionMap.get(review.rating) || 0;
    distributionMap.set(review.rating, count + 1);
  });
  const ratingDistribution = Array.from(distributionMap.entries())
    .map(([rating, count]) => ({
      rating,
      count,
      percentage: Math.round((count / totalReviews) * 100),
    }))
    .sort((a, b) => b.rating - a.rating);
  const recentReviews = await Review.find({ guideId, isHidden: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate([
      { path: "tourist", select: "name profilePic" },
      { path: "listing", select: "title city country" },
    ]);
  return {
    totalReviews,
    averageRating: Math.round((totals.rating / totalReviews) * 10) / 10,
    averageGuideRating:
      Math.round((totals.guideRating / totalReviews) * 10) / 10,
    averageCommunicationRating:
      Math.round((totals.communicationRating / totalReviews) * 10) / 10,
    averageValueRating:
      Math.round((totals.valueRating / totalReviews) * 10) / 10,
    averageExperienceRating:
      Math.round((totals.experienceRating / totalReviews) * 10) / 10,
    ratingDistribution,
    recentReviews,
  };
};
export default {
  createReview,
  getReviewById,
  getAllReviews,
  getReviewsByListing,
  getReviewsByGuide,
  getReviewsByTourist,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview,
  toggleReviewVisibility,
  getReviewStats,
  getGuideReviewSummary,
};