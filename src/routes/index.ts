import express from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import listingRoutes from "../modules/listings/listing.routes";
import bookingRoutes from "../modules/bookings/booking.routes";
import reviewRoutes from "../modules/reviews/review.routes";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/listings", listingRoutes);
router.use("/bookings", bookingRoutes);
router.use("/reviews", reviewRoutes);

export default router;