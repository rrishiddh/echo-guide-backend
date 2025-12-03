import { Document, Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  touristId: string;
  guideId: string;
  listingId: string;
  bookingId: string;
  rating: number;
  comment: string;
  guideRating?: number;
  communicationRating?: number;
  valueRating?: number;
  experienceRating?: number;
  isVerified: boolean;
  isEdited: boolean;
  helpful: number;
  reportCount: number;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface ICreateReviewRequest {
  listingId: string;
  bookingId: string;
  rating: number;
  comment: string;
  guideRating?: number;
  communicationRating?: number;
  valueRating?: number;
  experienceRating?: number;
}


export interface IUpdateReviewRequest {
  rating?: number;
  comment?: string;
  guideRating?: number;
  communicationRating?: number;
  valueRating?: number;
  experienceRating?: number;
}


export interface IReviewQuery {
  touristId?: string;
  guideId?: string;
  listingId?: string;
  minRating?: number;
  maxRating?: number;
  isVerified?: boolean;
  isHidden?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}


export interface IReviewListResponse {
  reviews: IReview[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    averageRating: number;
    ratingDistribution: {
      rating: number;
      count: number;
      percentage: number;
    }[];
  };
}


export interface IReviewStats {
  totalReviews: number;
  averageRating: number;
  verifiedReviews: number;
  hiddenReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  recentReviews: IReview[];
  topRatedListings: any[];
  topRatedGuides: any[];
}


export interface IGuideReviewSummary {
  totalReviews: number;
  averageRating: number;
  averageGuideRating: number;
  averageCommunicationRating: number;
  averageValueRating: number;
  averageExperienceRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  recentReviews: IReview[];
}


export interface IReportReviewRequest {
  reason: string;
}