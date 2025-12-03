import { Document,Types } from "mongoose";


export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  REJECTED = "rejected",
}


export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  REFUNDED = "refunded",
  FAILED = "failed",
}


export interface IBooking extends Document {
  _id: Types.ObjectId;
  touristId: string;
  guideId: string;
  listingId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


export interface ICreateBookingRequest {
  listingId: string;
  bookingDate: Date;
  startTime: string;
  numberOfPeople: number;
  specialRequests?: string;
}


export interface IUpdateBookingStatusRequest {
  status: BookingStatus;
  rejectionReason?: string;
}


export interface ICancelBookingRequest {
  cancellationReason: string;
}


export interface IBookingQuery {
  touristId?: string;
  guideId?: string;
  listingId?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
}


export interface IBookingListResponse {
  bookings: IBooking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


export interface IBookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  bookingsByStatus: {
    status: string;
    count: number;
  }[];
  recentBookings: IBooking[];
  upcomingBookings: IBooking[];
}


export interface IGuideEarnings {
  totalEarnings: number;
  completedBookings: number;
  pendingEarnings: number;
  averageEarningPerBooking: number;
  earningsByMonth: {
    month: string;
    earnings: number;
    bookings: number;
  }[];
}