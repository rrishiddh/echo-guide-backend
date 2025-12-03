import express from "express";
import bookingController from "./booking.controller";
import authenticate from "../../middlewares/auth";
import { authorize, isGuide, canAccessBooking } from "../../middlewares/roleCheck";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validateRequest";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  bookingQuerySchema,
  bookingIdParamSchema,
} from "./booking.validation";

const router = express.Router();


router.get(
  "/admin/stats",
  authenticate,
  authorize("admin"),
  bookingController.getBookingStats
);


router.get(
  "/",
  authenticate,
  authorize("admin"),
  validateQuery(bookingQuerySchema),
  bookingController.getAllBookings
);


router.post(
  "/",
  authenticate,
  authorize("tourist"),
  validateBody(createBookingSchema),
  bookingController.createBooking
);


router.get(
  "/my-bookings",
  authenticate,
  validateQuery(bookingQuerySchema),
  bookingController.getMyBookings
);


router.get(
  "/upcoming",
  authenticate,
  bookingController.getUpcomingBookings
);

router.get(
  "/past",
  authenticate,
  bookingController.getPastBookings
);

router.get(
  "/earnings",
  authenticate,
  isGuide,
  bookingController.getGuideEarnings
);


router.get(
  "/:id",
  authenticate,
  validateParams(bookingIdParamSchema),
  bookingController.getBookingById
);

router.patch(
  "/:id/status",
  authenticate,
  isGuide,
  validateParams(bookingIdParamSchema),
  validateBody(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

router.patch(
  "/:id/cancel",
  authenticate,
  validateParams(bookingIdParamSchema),
  validateBody(cancelBookingSchema),
  bookingController.cancelBooking
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize("guide", "admin"),
  validateParams(bookingIdParamSchema),
  bookingController.completeBooking
);

export default router;
