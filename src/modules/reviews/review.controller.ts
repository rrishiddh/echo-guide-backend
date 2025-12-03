import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { successResponse } from "../../utils/ApiResponse";
import reviewService from "./review.service";


const createReview = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const touristId = req.user!.userId;
    const result = await reviewService.createReview(touristId, req.body);

    successResponse(
      res,
      result,
      "Review submitted successfully! Thank you for your feedback.",
      null,
      httpStatus.CREATED
    );
  }
);


const getReviewById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await reviewService.getReviewById(req.params.id);

    successResponse(
      res,
      result,
      "Review retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const getAllReviews = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await reviewService.getAllReviews(req.query);

    successResponse(
      res,
      result.reviews,
      "Reviews retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const getReviewsByListing = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await reviewService.getReviewsByListing(
      req.params.listingId,
      req.query
    );

    successResponse(
      res,
      result.reviews,
      "Listing reviews retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const getReviewsByGuide = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await reviewService.getReviewsByGuide(
      req.params.guideId,
      req.query
    );

    successResponse(
      res,
      result.reviews,
      "Guide reviews retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const getMyReviews = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const touristId = req.user!.userId;
    const result = await reviewService.getReviewsByTourist(touristId, req.query);

    successResponse(
      res,
      result.reviews,
      "Your reviews retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const getGuideReviewSummary = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await reviewService.getGuideReviewSummary(req.params.guideId);

    successResponse(
      res,
      result,
      "Guide review summary retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const updateReview = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const touristId = req.user!.userId;
    const result = await reviewService.updateReview(
      req.params.id,
      touristId,
      req.body
    );

    successResponse(
      res,
      result,
      "Review updated successfully",
      null,
      httpStatus.OK
    );
  }
);


const deleteReview = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const touristId = req.user!.userId;
    await reviewService.deleteReview(req.params.id, touristId);

    successResponse(
      res,
      null,
      "Review deleted successfully",
      null,
      httpStatus.OK
    );
  }
);


const markReviewHelpful = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await reviewService.markReviewHelpful(req.params.id, req.body.helpful);

    successResponse(
      res,
      null,
      "Thank you for your feedback!",
      null,
      httpStatus.OK
    );
  }
);


const reportReview = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    await reviewService.reportReview(req.params.id, userId, req.body.reason);

    successResponse(
      res,
      null,
      "Review reported successfully. We'll review it shortly.",
      null,
      httpStatus.OK
    );
  }
);


const toggleReviewVisibility = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await reviewService.toggleReviewVisibility(
      req.params.id,
      req.body.isHidden,
      req.body.reason
    );

    successResponse(
      res,
      null,
      `Review ${req.body.isHidden ? "hidden" : "unhidden"} successfully`,
      null,
      httpStatus.OK
    );
  }
);


const getReviewStats = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await reviewService.getReviewStats();

    successResponse(
      res,
      result,
      "Review statistics retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

export default {
  createReview,
  getReviewById,
  getAllReviews,
  getReviewsByListing,
  getReviewsByGuide,
  getMyReviews,
  getGuideReviewSummary,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview,
  toggleReviewVisibility,
  getReviewStats,
};