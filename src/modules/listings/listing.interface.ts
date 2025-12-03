import { Document,Types } from "mongoose";


export enum TourCategory {
  FOOD = "Food",
  ART = "Art",
  ADVENTURE = "Adventure",
  HISTORY = "History",
  CULTURE = "Culture",
  NIGHTLIFE = "Nightlife",
  SHOPPING = "Shopping",
  NATURE = "Nature",
  PHOTOGRAPHY = "Photography",
  SPORTS = "Sports",
  WELLNESS = "Wellness",
  FAMILY = "Family",
}

export enum ListingStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
}


export interface IListing extends Document {
  _id: Types.ObjectId;
  guideId: string;
  title: string;
  description: string;
  itinerary: string;
  tourFee: number;
  duration: number;
  meetingPoint: string;
  maxGroupSize: number;
  category: TourCategory[];
  images: string[];
  status: ListingStatus;
  totalBookings: number;
  averageRating: number;
  totalReviews: number;
  city: string;
  country: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface ICreateListingRequest {
  title: string;
  description: string;
  itinerary: string;
  tourFee: number;
  duration: number;
  meetingPoint: string;
  maxGroupSize: number;
  category: TourCategory[];
  city: string;
  country: string;
  images?: string[];
}


export interface IUpdateListingRequest {
  title?: string;
  description?: string;
  itinerary?: string;
  tourFee?: number;
  duration?: number;
  meetingPoint?: string;
  maxGroupSize?: number;
  category?: TourCategory[];
  city?: string;
  country?: string;
  images?: string[];
  status?: ListingStatus;
}


export interface IListingQuery {
  guideId?: string;
  category?: TourCategory | TourCategory[];
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  city?: string;
  country?: string;
  search?: string;
  status?: ListingStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}


export interface IListingListResponse {
  listings: IListing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


export interface IListingStats {
  totalListings: number;
  activeListings: number;
  inactiveListings: number;
  draftListings: number;
  totalBookings: number;
  averagePrice: number;
  listingsByCategory: {
    category: string;
    count: number;
  }[];
  topRatedListings: IListing[];
  recentListings: IListing[];
}