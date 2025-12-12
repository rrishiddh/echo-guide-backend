import httpStatus from "http-status";
import Payment from "./payment.model";
import Booking from "../bookings/booking.model";
import User from "../users/user.model";
import ApiError from "../../utils/ApiError";
import { connectDatabase } from "../../config/database";
import {
  ICreatePaymentIntentRequest,
  IConfirmPaymentRequest,
  IRefundPaymentRequest,
  IPaymentQuery,
  IPaymentListResponse,
  IPaymentStats,
  PaymentStatus,
  TransactionType,
  PaymentMethod,
} from "./payment.interface";
import { logger } from "../../config/logger";
import {
  parsePaginationParams,
  calculatePagination,
} from "../../utils/helpers";
import { BookingStatus } from "../bookings/booking.interface";
import {
  createPaymentIntent as stripeCreatePaymentIntent,
  confirmPaymentIntent as stripeConfirmPaymentIntent,
  createRefund as stripeCreateRefund,
  createCustomer,
} from "../../config/payment";

const createPaymentIntent = async (
  touristId: string,
  payload: ICreatePaymentIntentRequest
) => {
  await connectDatabase();
  const booking = await Booking.findById(payload.bookingId).populate("listing");

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.touristId.toString() !== touristId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only pay for your own bookings"
    );
  }

  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Booking must be confirmed before payment"
    );
  }

  const existingPayment = await Payment.findOne({
    bookingId: payload.bookingId,
    status: { $in: [PaymentStatus.COMPLETED, PaymentStatus.PROCESSING] },
  });

  if (existingPayment) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Payment already exists for this booking"
    );
  }

  const tourist = await User.findById(touristId);
  let stripeCustomerId = tourist?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await createCustomer(tourist!.email, tourist!.name, {
      userId: touristId,
    });
    stripeCustomerId = customer.id;

    if (tourist) {
      (tourist as any).stripeCustomerId = stripeCustomerId;
      await tourist.save();
    }
  }

  const amount = payload.amount ?? booking.totalPrice;

  const paymentIntent = await stripeCreatePaymentIntent(amount, "usd", {
    bookingId: payload.bookingId,
    touristId,
    guideId: booking.guideId.toString(),
  });

  const clientSecret = paymentIntent.client_secret ?? undefined;

  const payment = (await Payment.create({
    bookingId: payload.bookingId,
    touristId,
    guideId: booking.guideId.toString(),
    amount,
    currency: "usd",
    paymentMethod: PaymentMethod.STRIPE,
    status: PaymentStatus.PENDING,
    transactionType: TransactionType.PAYMENT,
    paymentIntentId: paymentIntent.id,
    clientSecret,
    stripeCustomerId,
    metadata: {
      listingTitle: (booking as any).listing?.title,
      bookingDate: booking.bookingDate,
    },
  })) as unknown as any; 

  booking.paymentStatus = "pending" as any;
  booking.paymentIntentId = paymentIntent.id;
  await booking.save();

  logger.info(
    `Payment intent created: ${
      payment._id?.toString ? payment._id.toString() : payment._id
    } for booking: ${payload.bookingId}`
  );

  return {
    paymentId: payment._id?.toString ? payment._id.toString() : payment._id,
    clientSecret,
    paymentIntentId: paymentIntent.id,
    amount: payment.amount,
    currency: payment.currency,
  };
};

const confirmPayment = async (
  touristId: string,
  payload: IConfirmPaymentRequest
) => {
  await connectDatabase();
  const payment = await Payment.findOne({
    paymentIntentId: payload.paymentIntentId,
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.touristId.toString() !== touristId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only confirm your own payments"
    );
  }

  const paymentIntent = await stripeConfirmPaymentIntent(
    payload.paymentIntentId
  );

  if (paymentIntent.status === "succeeded") {
    payment.status = PaymentStatus.COMPLETED;
    payment.processedAt = new Date();

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: "paid",
    });

    logger.info(`Payment completed: ${payment._id}`);
  } else if (paymentIntent.status === "processing") {
    payment.status = PaymentStatus.PROCESSING;
    logger.info(`Payment processing: ${payment._id}`);
  } else {
    payment.status = PaymentStatus.FAILED;
    payment.failureReason = "Payment failed";
    logger.warn(`Payment failed: ${payment._id}`);
  }

  await payment.save();

  return payment;
};

const getPaymentById = async (paymentId: string) => {
  await connectDatabase();
  const payment = await Payment.findById(paymentId).populate([
    { path: "tourist", select: "name email profilePic" },
    { path: "guide", select: "name email profilePic" },
    { path: "booking", select: "bookingDate startTime endTime" },
  ]);

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  return payment;
};

const getAllPayments = async (
  query: IPaymentQuery
): Promise<IPaymentListResponse> => {
  await connectDatabase();
  const {
    touristId,
    guideId,
    bookingId,
    status,
    transactionType,
    startDate,
    endDate,
    minAmount,
    maxAmount,
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

  if (bookingId) {
    filter.bookingId = bookingId;
  }

  if (status) {
    filter.status = status;
  }

  if (transactionType) {
    filter.transactionType = transactionType;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = startDate;
    }
    if (endDate) {
      filter.createdAt.$lte = endDate;
    }
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    filter.amount = {};
    if (minAmount !== undefined) {
      filter.amount.$gte = minAmount;
    }
    if (maxAmount !== undefined) {
      filter.amount.$lte = maxAmount;
    }
  }

  const { skip } = parsePaginationParams({ page, limit });

  const sortOrder: any = {};
  if (sortBy.startsWith("-")) {
    sortOrder[sortBy.substring(1)] = -1;
  } else {
    sortOrder[sortBy] = 1;
  }

  const total = await Payment.countDocuments(filter);

  const payments = await Payment.find(filter)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .populate([
      { path: "tourist", select: "name email profilePic" },
      { path: "guide", select: "name email profilePic" },
      { path: "booking", select: "bookingDate startTime" },
    ])
    .select("-__v");

  const amountResult = await Payment.aggregate([
    { $match: filter },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);
  const totalAmount = amountResult[0]?.totalAmount || 0;

  const meta = {
    ...calculatePagination(total, page, limit),
    totalAmount,
  };

  return {
    payments,
    meta,
  };
};

const getTouristPayments = async (
  touristId: string,
  query: IPaymentQuery
): Promise<IPaymentListResponse> => {
  return getAllPayments({ ...query, touristId });
};

const getGuidePayments = async (
  guideId: string,
  query: IPaymentQuery
): Promise<IPaymentListResponse> => {
  return getAllPayments({ ...query, guideId, status: PaymentStatus.COMPLETED });
};

const refundPayment = async (
  paymentId: string,
  payload: IRefundPaymentRequest
) => {
  await connectDatabase();
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (
    payment.status === PaymentStatus.REFUNDED ||
    payment.status === PaymentStatus.PARTIALLY_REFUNDED
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment has already been refunded"
    );
  }

  if (payment.status !== PaymentStatus.COMPLETED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only completed payments can be refunded"
    );
  }

  const refundAmount = payload.amount ?? payment.amount;

  if (refundAmount > payment.amount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Refund amount cannot exceed payment amount"
    );
  }

  if (payment.paymentIntentId) {
    await stripeCreateRefund(payment.paymentIntentId, refundAmount);
  }

  payment.status =
    refundAmount === payment.amount
      ? PaymentStatus.REFUNDED
      : PaymentStatus.PARTIALLY_REFUNDED;
  payment.refundAmount = (payment.refundAmount || 0) + refundAmount;
  payment.refundReason = payload.reason;
  payment.refundedAt = new Date();

  await payment.save();

  await Booking.findByIdAndUpdate(payment.bookingId, {
    paymentStatus: "refunded",
  });

  await Payment.create({
    bookingId: payment.bookingId,
    touristId: payment.touristId,
    guideId: payment.guideId,
    amount: refundAmount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    status: PaymentStatus.COMPLETED, 
    transactionType: TransactionType.REFUND,
    metadata: {
      originalPaymentId: payment._id,
      refundReason: payload.reason,
    },
  });

  logger.info(
    `Payment refunded: ${paymentId} - Amount: ${refundAmount} - Reason: ${payload.reason}`
  );

  return payment;
};

const getPaymentStats = async (): Promise<IPaymentStats> => {
  await connectDatabase();
  const totalPayments = await Payment.countDocuments();

  const amountResult = await Payment.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalAmount = amountResult[0]?.total || 0;

  const completedResult = await Payment.aggregate([
    {
      $match: {
        status: PaymentStatus.COMPLETED,
        transactionType: TransactionType.PAYMENT,
      },
    },
    { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } } },
  ]);
  const completedPayments = completedResult[0]?.count || 0;
  const completedAmount = completedResult[0]?.amount || 0;

  const pendingResult = await Payment.aggregate([
    { $match: { status: PaymentStatus.PENDING } },
    { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" } } },
  ]);
  const pendingPayments = pendingResult[0]?.count || 0;
  const pendingAmount = pendingResult[0]?.amount || 0;

  const refundedResult = await Payment.aggregate([
    {
      $match: {
        status: {
          $in: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        amount: { $sum: "$refundAmount" },
      },
    },
  ]);
  const refundedPayments = refundedResult[0]?.count || 0;
  const refundedAmount = refundedResult[0]?.amount || 0;

  const failedPayments = await Payment.countDocuments({
    status: PaymentStatus.FAILED,
  });

  const statusResult = await Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
    { $project: { status: "$_id", count: 1, amount: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  const methodResult = await Payment.aggregate([
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
    { $project: { method: "$_id", count: 1, amount: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  const recentPayments = await Payment.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate([
      { path: "tourist", select: "name email profilePic" },
      { path: "guide", select: "name email profilePic" },
      { path: "booking", select: "bookingDate" },
    ]);

  return {
    totalPayments,
    totalAmount,
    completedPayments,
    completedAmount,
    pendingPayments,
    pendingAmount,
    refundedPayments,
    refundedAmount,
    failedPayments,
    paymentsByStatus: statusResult,
    paymentsByMethod: methodResult,
    recentPayments,
  };
};

const handleWebhookEvent = async (event: any) => {
  await connectDatabase();
  logger.info(`Processing webhook event: ${event.type}`);

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object);
      break;

    default:
      logger.info(`Unhandled webhook event type: ${event.type}`);
  }
};

const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
  const payment = await Payment.findOne({
    paymentIntentId: paymentIntent.id,
  });

  if (payment && payment.status !== PaymentStatus.COMPLETED) {
    payment.status = PaymentStatus.COMPLETED;
    payment.processedAt = new Date();
    await payment.save();

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: "paid",
    });

    logger.info(`Payment completed via webhook: ${payment._id}`);
  }
};

const handlePaymentIntentFailed = async (paymentIntent: any) => {
  const payment = await Payment.findOne({
    paymentIntentId: paymentIntent.id,
  });

  if (payment) {
    payment.status = PaymentStatus.FAILED;
    payment.failureReason =
      paymentIntent.last_payment_error?.message || "Payment failed";
    payment.processedAt = new Date();
    await payment.save();

    logger.warn(`Payment failed via webhook: ${payment._id}`);
  }
};

const handleChargeRefunded = async (charge: any) => {
  const payment = await Payment.findOne({
    paymentIntentId: charge.payment_intent,
  });
  if (payment && payment.status !== PaymentStatus.REFUNDED) {
    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    await payment.save();
    logger.info(`Payment refunded via webhook: ${payment._id}`);
  }
};
export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentById,
  getAllPayments,
  getTouristPayments,
  getGuidePayments,
  refundPayment,
  getPaymentStats,
  handleWebhookEvent,
};