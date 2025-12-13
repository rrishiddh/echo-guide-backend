import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { successResponse } from "../../utils/ApiResponse";
import listingService from "./listing.service";
import { uploadMultipleToCloudinary } from "../../config/cloudinary";
import { processUploadedFiles } from "../../middlewares/uploadHandler";

const createListing = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const guideId = req.user!.userId;

    const body = (req as any).validatedBody || req.body;

    let imageUrls: string[] = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const dataUrls = processUploadedFiles(req.files);
      const uploadResults = await uploadMultipleToCloudinary(
        dataUrls,
        "listings"
      );
      imageUrls = uploadResults.map((result) => result.url);
    }

    if (body.images) {
      if (Array.isArray(body.images)) {
        imageUrls = [...imageUrls, ...body.images];
      } else if (typeof body.images === "string") {
        imageUrls = [...imageUrls, body.images];
      }
    }

    if (imageUrls.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "No images provided",
        errors: { isOperational: true },
      });
    }

    const listingData = {
      ...body,
      images: imageUrls,
    };

    const result = await listingService.createListing(guideId, listingData);

    return successResponse(
      res,
      result,
      "Listing created successfully!",
      null,
      httpStatus.CREATED
    );
  }
);

const getListingById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const params = (req as any).validatedParams || req.params;
    const result = await listingService.getListingById(params.id);

    successResponse(
      res,
      result,
      "Listing retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

const getAllListings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = (req as any).validatedQuery || req.query;
    const result = await listingService.getAllListings(query);
    successResponse(
      res,
      result.listings,
      "Listings retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);

const searchListings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = (req as any).validatedQuery || req.query;
    const result = await listingService.searchListings(query);
    successResponse(
      res,
      result.listings,
      "Search completed successfully",
      result.meta,
      httpStatus.OK
    );
  }
);

const getFeaturedListings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = (req as any).validatedQuery || req.query;
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const result = await listingService.getFeaturedListings(limit);
    successResponse(
      res,
      result,
      "Featured listings retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

const getPopularListings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = (req as any).validatedQuery || req.query;
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const result = await listingService.getPopularListings(limit);
    successResponse(
      res,
      result,
      "Popular listings retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

const getRecentListings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = (req as any).validatedQuery || req.query;
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const result = await listingService.getRecentListings(limit);
    successResponse(
      res,
      result,
      "Recent listings retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

const getListingsByGuide = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = (req as any).validatedQuery || req.query;
    const params = (req as any).validatedParams || req.params;
    const result = await listingService.getListingsByGuide(
      params.guideId,
      query
    );
    successResponse(
      res,
      result.listings,
      "Guide listings retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);

const updateListing = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const guideId = req.user!.userId;
    const body = (req as any).validatedBody || req.body;

    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const dataUrls = processUploadedFiles(req.files);
      const uploadResults = await uploadMultipleToCloudinary(
        dataUrls,
        "listings"
      );
      imageUrls = uploadResults.map((result) => result.url);
    }

    const updateData = {
      ...body,
      ...(imageUrls.length > 0 && { images: imageUrls }),
    };

    const params = (req as any).validatedParams || req.params;
    const result = await listingService.updateListing(params.id, guideId, updateData);

    successResponse(
      res,
      result,
      "Listing updated successfully",
      null,
      httpStatus.OK
    );
  }
);

const deleteListing = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const guideId = req.user!.userId;
    const params = (req as any).validatedParams || req.params;

    await listingService.deleteListing(params.id, guideId);

    successResponse(
      res,
      null,
      "Listing deactivated successfully",
      null,
      httpStatus.OK
    );
  }
);

const permanentlyDeleteListing = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const params = (req as any).validatedParams || req.params;
    await listingService.permanentlyDeleteListing(params.id);
    successResponse(
      res,
      null,
      "Listing permanently deleted",
      null,
      httpStatus.OK
    );
  }
);

const getListingStats = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await listingService.getListingStats();
    successResponse(
      res,
      result,
      "Listing statistics retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

export default {
  createListing,
  getListingById,
  getAllListings,
  searchListings,
  getFeaturedListings,
  getPopularListings,
  getRecentListings,
  getListingsByGuide,
  updateListing,
  deleteListing,
  permanentlyDeleteListing,
  getListingStats,
};
