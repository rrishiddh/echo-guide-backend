import httpStatus from "http-status";
import User from "../users/user.model";
import Listing from "../listings/listing.model";
import Booking from "../bookings/booking.model";
import Payment from "../payments/payment.model";
import Review from "../reviews/review.model";
import ApiError from "../../utils/ApiError";
import { logger } from "../../config/logger";
import { UserRole } from "../auth/auth.interface";
import { ListingStatus } from "../listings/listing.interface";
import { BookingStatus, PaymentStatus } from "../bookings/booking.interface";
import { connectDatabase } from "../../config/database";
 
const getDashboardOverview = async (startDate?: Date, endDate?: Date) => {
  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = startDate;
    if (endDate) dateFilter.createdAt.$lte = endDate;
  }

  const totalUsers = await User.countDocuments(dateFilter);
  const totalTourists = await User.countDocuments({
    ...dateFilter,
    role: UserRole.TOURIST,
  });
  const totalGuides = await User.countDocuments({
    ...dateFilter,
    role: UserRole.GUIDE,
  });
  const activeUsers = await User.countDocuments({
    ...dateFilter,
    isActive: true,
  });
  const verifiedUsers = await User.countDocuments({
    ...dateFilter,
    isVerified: true,
  });

  const totalListings = await Listing.countDocuments(dateFilter);
  const activeListings = await Listing.countDocuments({
    ...dateFilter,
    status: ListingStatus.ACTIVE,
    isActive: true,
  });
  const draftListings = await Listing.countDocuments({
    ...dateFilter,
    status: ListingStatus.DRAFT,
  });

  const totalBookings = await Booking.countDocuments(dateFilter);
  const confirmedBookings = await Booking.countDocuments({
    ...dateFilter,
    status: BookingStatus.CONFIRMED,
  });
  const completedBookings = await Booking.countDocuments({
    ...dateFilter,
    status: BookingStatus.COMPLETED,
  });
  const cancelledBookings = await Booking.countDocuments({
    ...dateFilter,
    status: BookingStatus.CANCELLED,
  });

  const paymentStats = await Payment.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const totalRevenue =
    paymentStats
      .filter((stat) => stat._id === "completed")
      .reduce((sum, stat) => sum + stat.totalAmount, 0) || 0;

  const pendingRevenue =
    paymentStats
      .filter((stat) => stat._id === "pending")
      .reduce((sum, stat) => sum + stat.totalAmount, 0) || 0;

  const totalReviews = await Review.countDocuments(dateFilter);
  const avgRatingResult = await Review.aggregate([
    { $match: { ...dateFilter, isHidden: false } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);
  const averageRating = avgRatingResult[0]?.avgRating || 0;

  let growthMetrics = {};
  if (startDate && endDate) {
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    const previousUsers = await User.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: previousEndDate },
    });
    const previousBookings = await Booking.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: previousEndDate },
    });

    const userGrowth =
      previousUsers > 0
        ? ((totalUsers - previousUsers) / previousUsers) * 100
        : 0;
    const bookingGrowth =
      previousBookings > 0
        ? ((totalBookings - previousBookings) / previousBookings) * 100
        : 0;

    growthMetrics = {
      userGrowth: Math.round(userGrowth * 10) / 10,
      bookingGrowth: Math.round(bookingGrowth * 10) / 10,
    };
  }

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email role createdAt");

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("tourist", "name email")
    .populate("guide", "name email")
    .populate("listing", "title");

  const recentReviews = await Review.find({ isHidden: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("tourist", "name")
    .populate("listing", "title");

  return {
    users: {
      total: totalUsers,
      tourists: totalTourists,
      guides: totalGuides,
      active: activeUsers,
      verified: verifiedUsers,
    },
    listings: {
      total: totalListings,
      active: activeListings,
      draft: draftListings,
    },
    bookings: {
      total: totalBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
    },
    payments: {
      totalRevenue: Math.round(totalRevenue),
      pendingRevenue: Math.round(pendingRevenue),
      paymentsByStatus: paymentStats,
    },
    reviews: {
      total: totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
    },
    growth: growthMetrics,
    recentActivity: {
      users: recentUsers,
      bookings: recentBookings,
      reviews: recentReviews,
    },
  };
};


const getAnalytics = async (period: string = "month") => {
  let startDate: Date;
  const endDate = new Date();

  switch (period) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date(0);
  }

  const userTrend = await User.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const bookingTrend = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const revenueByMonth = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const popularCategories = await Listing.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$category" },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const topGuides = await Booking.aggregate([
    {
      $match: {
        status: BookingStatus.COMPLETED,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$guideId",
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
  ]);

  const populatedTopGuides = await User.populate(topGuides, {
    path: "_id",
    select: "name email profilePic expertise",
  });

  const topListings = await Review.aggregate([
    { $match: { isHidden: false } },
    {
      $group: {
        _id: "$listingId",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
    { $match: { totalReviews: { $gte: 3 } } },
    { $sort: { avgRating: -1, totalReviews: -1 } },
    { $limit: 10 },
  ]);

  const populatedTopListings = await Listing.populate(topListings, {
    path: "_id",
    select: "title city country images tourFee",
  });

  return {
    userTrend,
    bookingTrend,
    revenueByMonth,
    popularCategories,
    topGuides: populatedTopGuides,
    topListings: populatedTopListings,
  };
};


const bulkUpdateUsers = async (
  ids: string[],
  action: string
): Promise<{ updated: number }> => {
  let updateData: any = {};

  switch (action) {
    case "activate":
      updateData = { isActive: true };
      break;
    case "deactivate":
      updateData = { isActive: false };
      break;
    case "verify":
      updateData = { isVerified: true };
      break;
    case "unverify":
      updateData = { isVerified: false };
      break;
    case "delete":
      const result = await User.deleteMany({ _id: { $in: ids } });
      logger.warn(`Bulk deleted ${result.deletedCount} users`);
      return { updated: result.deletedCount || 0 };
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid action");
  }

  const result = await User.updateMany({ _id: { $in: ids } }, updateData);

  logger.info(`Bulk updated ${result.modifiedCount} users - Action: ${action}`);

  return { updated: result.modifiedCount || 0 };
};


const bulkUpdateListings = async (
  ids: string[],
  action: string
): Promise<{ updated: number }> => {
  let updateData: any = {};

  switch (action) {
    case "activate":
      updateData = { isActive: true, status: ListingStatus.ACTIVE };
      break;
    case "deactivate":
      updateData = { isActive: false, status: ListingStatus.INACTIVE };
      break;
    case "delete":
      const result = await Listing.deleteMany({ _id: { $in: ids } });
      logger.warn(`Bulk deleted ${result.deletedCount} listings`);
      return { updated: result.deletedCount || 0 };
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid action");
  }

  const result = await Listing.updateMany({ _id: { $in: ids } }, updateData);

  logger.info(
    `Bulk updated ${result.modifiedCount} listings - Action: ${action}`
  );

  return { updated: result.modifiedCount || 0 };
};


const getSystemHealth = async () => {
  const dbStatus = await checkDatabaseConnection();
  const memoryUsage = process.memoryUsage();

  return {
    status: "operational",
    uptime: process.uptime(),
    database: dbStatus,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + " MB",
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + " MB",
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + " MB",
    },
    timestamp: new Date(),
  };
};


const checkDatabaseConnection = async () => {
  try {
     await connectDatabase();
    await User.findOne().limit(1);
    return { status: "connected", message: "Database connection healthy" };
  } catch (error) {
    logger.error("Database health check failed:", error);
    return { status: "disconnected", message: "Database connection failed" };
  }
};


const getReportedContent = async () => {
  const reportedReviews = await Review.find({
    reportCount: { $gte: 1 },
    isHidden: false,
  })
    .sort({ reportCount: -1 })
    .limit(20)
    .populate("tourist", "name email")
    .populate("listing", "title");

  return {
    reviews: reportedReviews,
  };
};


const generateReport = async (
  reportType: string,
  startDate?: Date,
  endDate?: Date
) => {
  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = startDate;
    if (endDate) dateFilter.createdAt.$lte = endDate;
  }

  switch (reportType) {
    case "users":
      return await generateUserReport(dateFilter);
    case "bookings":
      return await generateBookingReport(dateFilter);
    case "revenue":
      return await generateRevenueReport(dateFilter);
    case "listings":
      return await generateListingReport(dateFilter);
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid report type");
  }
};

const generateUserReport = async (dateFilter: any) => {
  const users = await User.find(dateFilter).select(
    "name email role isActive isVerified createdAt"
  );
  return {
    reportType: "users",
    totalCount: users.length,
    data: users,
  };
};

const generateBookingReport = async (dateFilter: any) => {
  const bookings = await Booking.find(dateFilter)
    .populate("tourist", "name email")
    .populate("guide", "name email")
    .populate("listing", "title tourFee");

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  );

  return {
    reportType: "bookings",
    totalCount: bookings.length,
    totalRevenue,
    data: bookings,
  };
};

const generateRevenueReport = async (dateFilter: any) => {
  const payments = await Payment.find({
    ...dateFilter,
    status: "completed",
  }).populate("booking");

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  return {
    reportType: "revenue",
    totalCount: payments.length,
    totalRevenue,
    data: payments,
  };
};

const generateListingReport = async (dateFilter: any) => {
  const listings = await Listing.find(dateFilter).populate("guide", "name email");

  return {
    reportType: "listings",
    totalCount: listings.length,
    data: listings,
  };
};

export default {
  getDashboardOverview,
  getAnalytics,
  bulkUpdateUsers,
  bulkUpdateListings,
  getSystemHealth,
  getReportedContent,
  generateReport,
};