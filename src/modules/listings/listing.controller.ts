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

    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const dataUrls = processUploadedFiles(req.files);
      const uploadResults = await uploadMultipleToCloudinary(
        dataUrls,
        "listings"
      );
      imageUrls = uploadResults.map((result) => result.url);
    }

    const listingData = {
      ...req.body,
      images: imageUrls.length > 0 ? imageUrls : req.body.images || [],
    };

    const result = await listingService.createListing(guideId, listingData);

    successResponse(
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
    const result = await listingService.getListingById(req.params.id);

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
    const result = await listingService.getAllListings(req.query);
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
    const result = await listingService.searchListings(req.query);
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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
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
    const result = await listingService.getListingsByGuide(
      req.params.guideId,
      req.query
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
      ...req.body,
      ...(imageUrls.length > 0 && { images: imageUrls }),
    };
    const result = await listingService.updateListing(
      req.params.id,
      guideId,
      updateData
    );
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
    await listingService.deleteListing(req.params.id, guideId);
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
    await listingService.permanentlyDeleteListing(req.params.id);
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
