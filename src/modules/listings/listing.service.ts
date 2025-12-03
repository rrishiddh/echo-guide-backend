import httpStatus from "http-status";
import Listing from "./listing.model";
import User from "../users/user.model";
import ApiError from "../../utils/ApiError";
import {
  ICreateListingRequest,
  IUpdateListingRequest,
  IListingQuery,
  IListingListResponse,
  IListingStats,
  ListingStatus,
  TourCategory,
} from "./listing.interface";
import { logger } from "../../config/logger";
import { parsePaginationParams, calculatePagination } from "../../utils/helpers";
import { UserRole } from "../auth/auth.interface";


const createListing = async (
  guideId: string,
  payload: ICreateListingRequest
) => {
  const guide = await User.findById(guideId);

  if (!guide) {
    throw new ApiError(httpStatus.NOT_FOUND, "Guide not found");
  }

  if (guide.role !== UserRole.GUIDE) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only guides can create listings"
    );
  }

  if (!guide.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account is inactive. Please contact support."
    );
  }

  const listing = await Listing.create({
    ...payload,
    guideId,
  });

  logger.info(`New listing created: ${listing._id} by guide: ${guideId}`);

  return listing;
};


const getListingById = async (listingId: string, populateGuide = true) => {
  let query = Listing.findById(listingId);

  if (populateGuide) {
    query = query.populate("guide", "name email profilePic bio languagesSpoken expertise dailyRate isVerified");
  }

  const listing = await query;

  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Listing not found");
  }

  return listing;
};


const getAllListings = async (
  query: IListingQuery
): Promise<IListingListResponse> => {
  const {
    guideId,
    category,
    minPrice,
    maxPrice,
    minDuration,
    maxDuration,
    city,
    country,
    search,
    status,
    isActive,
    page = 1,
    limit = 10,
    sortBy = "-createdAt",
  } = query;

  const filter: any = {};

  if (guideId) {
    filter.guideId = guideId;
  }

  if (category) {
    const categories = Array.isArray(category) ? category : [category];
    filter.category = { $in: categories };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.tourFee = {};
    if (minPrice !== undefined) {
      filter.tourFee.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      filter.tourFee.$lte = maxPrice;
    }
  }

  if (minDuration !== undefined || maxDuration !== undefined) {
    filter.duration = {};
    if (minDuration !== undefined) {
      filter.duration.$gte = minDuration;
    }
    if (maxDuration !== undefined) {
      filter.duration.$lte = maxDuration;
    }
  }

  if (city) {
    filter.city = { $regex: city, $options: "i" };
  }

  if (country) {
    filter.country = { $regex: country, $options: "i" };
  }

  if (status) {
    filter.status = status;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const { skip } = parsePaginationParams({ page, limit });

  const sortOrder: any = {};
  if (sortBy.startsWith("-")) {
    sortOrder[sortBy.substring(1)] = -1;
  } else {
    sortOrder[sortBy] = 1;
  }

  const total = await Listing.countDocuments(filter);

  const listings = await Listing.find(filter)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .populate("guide", "name email profilePic bio languagesSpoken expertise dailyRate isVerified")
    .select("-__v");

  const meta = calculatePagination(total, page, limit);

  return {
    listings,
    meta,
  };
};


const updateListing = async (
  listingId: string,
  guideId: string,
  payload: IUpdateListingRequest
) => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Listing not found");
  }

  if (listing.guideId.toString() !== guideId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only update your own listings"
    );
  }

  Object.assign(listing, payload);
  await listing.save();

  logger.info(`Listing updated: ${listingId} by guide: ${guideId}`);

  return listing;
};


const deleteListing = async (
  listingId: string,
  guideId: string
): Promise<void> => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Listing not found");
  }

  if (listing.guideId.toString() !== guideId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only delete your own listings"
    );
  }

  listing.isActive = false;
  listing.status = ListingStatus.INACTIVE;
  await listing.save();

  logger.info(`Listing deactivated: ${listingId} by guide: ${guideId}`);
};


const permanentlyDeleteListing = async (listingId: string): Promise<void> => {
  const listing = await Listing.findByIdAndDelete(listingId);

  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Listing not found");
  }

  logger.warn(`Listing permanently deleted: ${listingId}`);
};


const getListingsByGuide = async (
  guideId: string,
  query: IListingQuery
): Promise<IListingListResponse> => {
  return getAllListings({ ...query, guideId });
};


const searchListings = async (
  query: IListingQuery
): Promise<IListingListResponse> => {
  return getAllListings({
    ...query,
    isActive: true,
    status: ListingStatus.ACTIVE,
  });
};


const getFeaturedListings = async (limit = 10) => {
  const listings = await Listing.find({
    isActive: true,
    status: ListingStatus.ACTIVE,
    averageRating: { $gte: 4.0 },
  })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit)
    .populate("guide", "name email profilePic bio isVerified");

  return listings;
};


const getPopularListings = async (limit = 10) => {
  const listings = await Listing.find({
    isActive: true,
    status: ListingStatus.ACTIVE,
  })
    .sort({ totalBookings: -1, averageRating: -1 })
    .limit(limit)
    .populate("guide", "name email profilePic bio isVerified");

  return listings;
};


const getRecentListings = async (limit = 10) => {
  const listings = await Listing.find({
    isActive: true,
    status: ListingStatus.ACTIVE,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("guide", "name email profilePic bio isVerified");

  return listings;
};


const getListingStats = async (): Promise<IListingStats> => {
  const totalListings = await Listing.countDocuments();
  const activeListings = await Listing.countDocuments({
    status: ListingStatus.ACTIVE,
    isActive: true,
  });
  const inactiveListings = await Listing.countDocuments({
    status: ListingStatus.INACTIVE,
  });
  const draftListings = await Listing.countDocuments({
    status: ListingStatus.DRAFT,
  });

  const bookingsResult = await Listing.aggregate([
    { $group: { _id: null, total: { $sum: "$totalBookings" } } },
  ]);
  const totalBookings = bookingsResult[0]?.total || 0;

  const priceResult = await Listing.aggregate([
    { $group: { _id: null, avgPrice: { $avg: "$tourFee" } } },
  ]);
  const averagePrice = Math.round(priceResult[0]?.avgPrice || 0);

  const categoryResult = await Listing.aggregate([
    { $unwind: "$category" },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { category: "$_id", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  const topRatedListings = await Listing.find({
    isActive: true,
    status: ListingStatus.ACTIVE,
    totalReviews: { $gte: 1 },
  })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(5)
    .populate("guide", "name email profilePic");

  const recentListings = await Listing.find({
    isActive: true,
    status: ListingStatus.ACTIVE,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("guide", "name email profilePic");

  return {
    totalListings,
    activeListings,
    inactiveListings,
    draftListings,
    totalBookings,
    averagePrice,
    listingsByCategory: categoryResult,
    topRatedListings,
    recentListings,
  };
};


const updateListingRating = async (
  listingId: string,
  newRating: number
): Promise<void> => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Listing not found");
  }

  const totalReviews = listing.totalReviews + 1;
  const totalRating = listing.averageRating * listing.totalReviews + newRating;
  const newAverageRating = totalRating / totalReviews;

  listing.totalReviews = totalReviews;
  listing.averageRating = Math.round(newAverageRating * 10) / 10; 

  await listing.save();

  logger.info(`Listing rating updated: ${listingId} - New avg: ${listing.averageRating}`);
};


const incrementBookingCount = async (listingId: string): Promise<void> => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Listing not found");
  }

  listing.totalBookings += 1;
  await listing.save();

  logger.info(`Listing booking count incremented: ${listingId} - Total: ${listing.totalBookings}`);
};

export default {
  createListing,
  getListingById,
  getAllListings,
  updateListing,
  deleteListing,
  permanentlyDeleteListing,
  getListingsByGuide,
  searchListings,
  getFeaturedListings,
  getPopularListings,
  getRecentListings,
  getListingStats,
  updateListingRating,
  incrementBookingCount,
};