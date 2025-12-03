import httpStatus from "http-status";
import Booking from "./booking.model";
import Listing from "../listings/listing.model";
import User from "../users/user.model";
import ApiError from "../../utils/ApiError";
import {
  ICreateBookingRequest,
  IUpdateBookingStatusRequest,
  ICancelBookingRequest,
  IBookingQuery,
  IBookingListResponse,
  IBookingStats,
  IGuideEarnings,
  BookingStatus,
  PaymentStatus,
} from "./booking.interface";
import { logger } from "../../config/logger";
import { parsePaginationParams, calculatePagination } from "../../utils/helpers";
import { UserRole } from "../auth/auth.interface";
import listingService from "../listings/listing.service";


const createBooking = async (
  touristId: string,
  payload: ICreateBookingRequest
) => {
  const tourist = await User.findById(touristId);

  if (!tourist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tourist not found");
  }

  if (tourist.role !== UserRole.TOURIST) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only tourists can create bookings"
    );
  }

  if (!tourist.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account is inactive. Please contact support."
    );
  }

  const listing = await Listing.findById(payload.listingId).populate("guide");

  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Listing not found");
  }

  if (!listing.isActive || listing.status !== "active") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This listing is not available for booking"
    );
  }

  if (payload.numberOfPeople > listing.maxGroupSize) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Maximum group size for this tour is ${listing.maxGroupSize}`
    );
  }

  const totalPrice = listing.tourFee * payload.numberOfPeople;

  const [hours, minutes] = payload.startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + listing.duration * 60;
  
  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;
  const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

  const booking = await Booking.create({
    touristId,
    guideId: listing.guideId,
    listingId: payload.listingId,
    bookingDate: payload.bookingDate,
    startTime: payload.startTime,
    endTime,
    numberOfPeople: payload.numberOfPeople,
    totalPrice,
    specialRequests: payload.specialRequests,
  });

  await booking.populate([
    { path: "tourist", select: "name email profilePic" },
    { path: "guide", select: "name email profilePic" },
    { path: "listing", select: "title city country images" },
  ]);

  logger.info(`New booking created: ${booking._id} by tourist: ${touristId}`);

  return booking;
};


const getBookingById = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId).populate([
    { path: "tourist", select: "name email profilePic languagesSpoken" },
    { path: "guide", select: "name email profilePic bio languagesSpoken expertise" },
    { path: "listing", select: "title description city country images tourFee duration" },
  ]);

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  return booking;
};


const getAllBookings = async (
  query: IBookingQuery
): Promise<IBookingListResponse> => {
  const {
    touristId,
    guideId,
    listingId,
    status,
    paymentStatus,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = "-createdAt",
  } = query;

  const filter: any = {};

  if (touristId) {
    filter.touristId = touristId;
  }

  if (guideId) {
    filter.guideId = guideId;
  }

  if (listingId) {
    filter.listingId = listingId;
  }

  if (status) {
    filter.status = status;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  if (startDate || endDate) {
    filter.bookingDate = {};
    if (startDate) {
      filter.bookingDate.$gte = startDate;
    }
    if (endDate) {
      filter.bookingDate.$lte = endDate;
    }
  }

  const { skip } = parsePaginationParams({ page, limit });

  const sortOrder: any = {};
  if (sortBy.startsWith("-")) {
    sortOrder[sortBy.substring(1)] = -1;
  } else {
    sortOrder[sortBy] = 1;
  }

  const total = await Booking.countDocuments(filter);

  const bookings = await Booking.find(filter)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .populate([
      { path: "tourist", select: "name email profilePic" },
      { path: "guide", select: "name email profilePic" },
      { path: "listing", select: "title city country images tourFee" },
    ])
    .select("-__v");

  const meta = calculatePagination(total, page, limit);

  return {
    bookings,
    meta,
  };
};


const updateBookingStatus = async (
  bookingId: string,
  guideId: string,
  payload: IUpdateBookingStatusRequest
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.guideId.toString() !== guideId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only update bookings for your listings"
    );
  }

  if (booking.status === BookingStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot update completed bookings"
    );
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot update cancelled bookings"
    );
  }

  booking.status = payload.status;

  if (payload.status === BookingStatus.REJECTED && payload.rejectionReason) {
    booking.cancellationReason = payload.rejectionReason;
    booking.cancelledBy = guideId;
    booking.cancelledAt = new Date();
  }

  if (payload.status === BookingStatus.CONFIRMED) {
    await listingService.incrementBookingCount(booking.listingId.toString());
  }

  await booking.save();

  logger.info(`Booking status updated: ${bookingId} - New status: ${payload.status}`);

  return booking;
};


const cancelBooking = async (
  bookingId: string,
  userId: string,
  payload: ICancelBookingRequest
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  const isTourist = booking.touristId.toString() === userId;
  const isGuide = booking.guideId.toString() === userId;

  if (!isTourist && !isGuide) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only cancel bookings you're involved in"
    );
  }

  if (booking.status === BookingStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot cancel completed bookings"
    );
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This booking is already cancelled"
    );
  }

  if (booking.bookingDate < new Date()) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot cancel past bookings"
    );
  }

  booking.status = BookingStatus.CANCELLED;
  booking.cancellationReason = payload.cancellationReason;
  booking.cancelledBy = userId;
  booking.cancelledAt = new Date();

  if (booking.paymentStatus === PaymentStatus.PAID) {
    booking.paymentStatus = PaymentStatus.REFUNDED;
  }

  await booking.save();

  logger.info(`Booking cancelled: ${bookingId} by user: ${userId}`);

  return booking;
};


const completeBooking = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only confirmed bookings can be completed"
    );
  }

  if (booking.paymentStatus !== PaymentStatus.PAID) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment must be completed before marking booking as complete"
    );
  }

  booking.status = BookingStatus.COMPLETED;
  booking.completedAt = new Date();
  await booking.save();

  logger.info(`Booking completed: ${bookingId}`);

  return booking;
};


const getTouristBookings = async (
  touristId: string,
  query: IBookingQuery
): Promise<IBookingListResponse> => {
  return getAllBookings({ ...query, touristId });
};


const getGuideBookings = async (
  guideId: string,
  query: IBookingQuery
): Promise<IBookingListResponse> => {
  return getAllBookings({ ...query, guideId });
};


const getUpcomingBookings = async (userId: string, role: "tourist" | "guide") => {
  const field = role === "tourist" ? "touristId" : "guideId";

  const bookings = await Booking.find({
    [field]: userId,
    bookingDate: { $gte: new Date() },
    status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
  })
    .sort({ bookingDate: 1 })
    .populate([
      { path: "tourist", select: "name email profilePic" },
      { path: "guide", select: "name email profilePic" },
      { path: "listing", select: "title city country images" },
    ]);

  return bookings;
};


const getPastBookings = async (userId: string, role: "tourist" | "guide") => {
  const field = role === "tourist" ? "touristId" : "guideId";

  const bookings = await Booking.find({
    [field]: userId,
    $or: [
      { bookingDate: { $lt: new Date() } },
      { status: { $in: [BookingStatus.COMPLETED, BookingStatus.CANCELLED] } },
    ],
  })
    .sort({ bookingDate: -1 })
    .populate([
      { path: "tourist", select: "name email profilePic" },
      { path: "guide", select: "name email profilePic" },
      { path: "listing", select: "title city country images" },
    ]);

  return bookings;
};


const getBookingStats = async (): Promise<IBookingStats> => {
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ status: BookingStatus.PENDING });
  const confirmedBookings = await Booking.countDocuments({ status: BookingStatus.CONFIRMED });
  const completedBookings = await Booking.countDocuments({ status: BookingStatus.COMPLETED });
  const cancelledBookings = await Booking.countDocuments({ status: BookingStatus.CANCELLED });

  const revenueResult = await Booking.aggregate([
    { $match: { status: BookingStatus.COMPLETED, paymentStatus: PaymentStatus.PAID } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  const averageBookingValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;

  const statusResult = await Booking.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate([
      { path: "tourist", select: "name email profilePic" },
      { path: "guide", select: "name email profilePic" },
      { path: "listing", select: "title city country" },
    ]);

  const upcomingBookings = await Booking.find({
    bookingDate: { $gte: new Date() },
    status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
  })
    .sort({ bookingDate: 1 })
    .limit(10)
    .populate([
      { path: "tourist", select: "name email profilePic" },
      { path: "guide", select: "name email profilePic" },
      { path: "listing", select: "title city country" },
    ]);

  return {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    averageBookingValue: Math.round(averageBookingValue),
    bookingsByStatus: statusResult,
    recentBookings,
    upcomingBookings,
  };
};


const getGuideEarnings = async (guideId: string): Promise<IGuideEarnings> => {
  const earningsResult = await Booking.aggregate([
    {
      $match: {
        guideId,
        status: BookingStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      },
    },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalEarnings = earningsResult[0]?.total || 0;

  const completedBookings = await Booking.countDocuments({
    guideId,
    status: BookingStatus.COMPLETED,
  });

  const pendingResult = await Booking.aggregate([
    {
      $match: {
        guideId,
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
      },
    },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const pendingEarnings = pendingResult[0]?.total || 0;

  const averageEarning= completedBookings > 0 ? totalEarnings / completedBookings : 0;
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
const monthlyEarnings = await Booking.aggregate([
    {
      $match: {
        guideId,
        status: BookingStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
        completedAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$completedAt" },
          month: { $month: "$completedAt" },
        },
        earnings: { $sum: "$totalPrice" },
        bookings: { $sum: 1 },
      },
    },
    {
      $project: {
        month: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $cond: [
                { $lt: ["$_id.month", 10] },
                { $concat: ["0", { $toString: "$_id.month" }] },
                { $toString: "$_id.month" },
              ],
            },
          ],
        },
        earnings: 1,
        bookings: 1,
        _id: 0,
      },
    },
    { $sort: { month: 1 } },
  ]);

return {
totalEarnings,
completedBookings,
pendingEarnings,
averageEarningPerBooking: Math.round(averageEarning),
earningsByMonth: monthlyEarnings,
};
};
export default {
createBooking,
getBookingById,
getAllBookings,
updateBookingStatus,
cancelBooking,
completeBooking,
getTouristBookings,
getGuideBookings,
getUpcomingBookings,
getPastBookings,
getBookingStats,
getGuideEarnings,
};