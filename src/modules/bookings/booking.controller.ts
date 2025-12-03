import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { successResponse } from "../../utils/ApiResponse";
import bookingService from "./booking.service";


const createBooking = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const touristId = req.user!.userId;
    const result = await bookingService.createBooking(touristId, req.body);

    successResponse(
      res,
      result,
      "Booking request sent successfully! Waiting for guide confirmation.",
      null,
      httpStatus.CREATED
    );
  }
);


const getBookingById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await bookingService.getBookingById(req.params.id);

    successResponse(
      res,
      result,
      "Booking retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

const getAllBookings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await bookingService.getAllBookings(req.query);

    successResponse(
      res,
      result.bookings,
      "Bookings retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const getMyBookings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let result;
    if (role === "tourist") {
      result = await bookingService.getTouristBookings(userId, req.query);
    } else if (role === "guide") {
      result = await bookingService.getGuideBookings(userId, req.query);
    } else {
      result = await bookingService.getAllBookings(req.query);
    }

    successResponse(
      res,
      result.bookings,
      "Your bookings retrieved successfully",
      result.meta,
      httpStatus.OK
    );
  }
);


const getUpcomingBookings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    const role = req.user!.role as "tourist" | "guide";

    const result = await bookingService.getUpcomingBookings(userId, role);

    successResponse(
      res,
      result,
      "Upcoming bookings retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const getPastBookings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    const role = req.user!.role as "tourist" | "guide";

    const result = await bookingService.getPastBookings(userId, role);

    successResponse(
      res,
      result,
      "Past bookings retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const updateBookingStatus = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const guideId = req.user!.userId;
    const result = await bookingService.updateBookingStatus(
      req.params.id,
      guideId,
      req.body
    );

    const message =
      req.body.status === "confirmed"
        ? "Booking confirmed successfully!"
        : "Booking rejected";

    successResponse(res, result, message, null, httpStatus.OK);
  }
);


const cancelBooking = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user!.userId;
    const result = await bookingService.cancelBooking(
      req.params.id,
      userId,
      req.body
    );

    successResponse(
      res,
      result,
      "Booking cancelled successfully",
      null,
      httpStatus.OK
    );
  }
);


const completeBooking = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await bookingService.completeBooking(req.params.id);

    successResponse(
      res,
      result,
      "Booking marked as completed",
      null,
      httpStatus.OK
    );
  }
);


const getBookingStats = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await bookingService.getBookingStats();

    successResponse(
      res,
      result,
      "Booking statistics retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);


const getGuideEarnings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const guideId = req.user!.userId;
    const result = await bookingService.getGuideEarnings(guideId);

    successResponse(
      res,
      result,
      "Earnings retrieved successfully",
      null,
      httpStatus.OK
    );
  }
);

export default {
  createBooking,
  getBookingById,
  getAllBookings,
  getMyBookings,
  getUpcomingBookings,
  getPastBookings,
  updateBookingStatus,
  cancelBooking,
  completeBooking,
  getBookingStats,
  getGuideEarnings,
};