import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { logger } from "../config/logger";


export type UserRole = "tourist" | "guide" | "admin";


export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Authentication required. Please login to continue."
        );
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn(
          `Unauthorized access attempt by user ${req.user.userId} with role ${userRole}`
        );

        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Access denied. This action requires ${allowedRoles.join(" or ")} privileges.`
        );
      }

      // User has required role, proceed
      next();
    } catch (error) {
      next(error);
    }
  };
};


export const isTourist = authorize("tourist");

export const isGuide = authorize("guide");


export const isAdmin = authorize("admin");

export const isGuideOrAdmin = authorize("guide", "admin");


export const canAccessOwnResource = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Authentication required"
      );
    }

    if (req.user.role === "admin") {
      return next();
    }

    const resourceUserId = req.params.id || req.params.userId;

    if (req.user.userId !== resourceUserId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only access your own resources"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};


export const canAccessOwnListing = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Authentication required"
      );
    }

    if (req.user.role === "admin") {
      return next();
    }

    const listing = (req as any).listing;

    if (!listing) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Listing not found"
      );
    }

    if (listing.guideId?.toString() !== req.user.userId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only modify your own listings"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};


export const canAccessBooking = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Authentication required"
      );
    }

    if (req.user.role === "admin") {
      return next();
    }

    const booking = (req as any).booking;

    if (!booking) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Booking not found"
      );
    }

    const isTourist = booking.touristId?.toString() === req.user.userId;
    const isGuide = booking.guideId?.toString() === req.user.userId;

    if (!isTourist && !isGuide) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only access bookings you're involved in"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default authorize;