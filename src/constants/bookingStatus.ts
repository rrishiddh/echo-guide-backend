export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  REJECTED: "rejected",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_DESCRIPTIONS = {
  [BOOKING_STATUS.PENDING]: "Booking request sent, waiting for guide confirmation",
  [BOOKING_STATUS.CONFIRMED]: "Guide has confirmed the booking",
  [BOOKING_STATUS.CANCELLED]: "Booking has been cancelled by tourist or guide",
  [BOOKING_STATUS.COMPLETED]: "Tour has been completed",
  [BOOKING_STATUS.REJECTED]: "Guide has rejected the booking request",
} as const;

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: "warning",
  [BOOKING_STATUS.CONFIRMED]: "info",
  [BOOKING_STATUS.CANCELLED]: "error",
  [BOOKING_STATUS.COMPLETED]: "success",
  [BOOKING_STATUS.REJECTED]: "error",
} as const;

export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: [],
  completed: [],
  rejected: [],
};

export const isValidStatusTransition = (
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): boolean => {
  return BOOKING_STATUS_TRANSITIONS[fromStatus].includes(toStatus);
};

export const CANCELLABLE_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
];

export const isCancellable = (status: BookingStatus): boolean => {
  return CANCELLABLE_STATUSES.includes(status);
};

export const ACTIVE_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
];

export const FINAL_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.REJECTED,
];

export const isActiveBooking = (status: BookingStatus): boolean => {
  return ACTIVE_STATUSES.includes(status);
};

export const isFinalBooking = (status: BookingStatus): boolean => {
  return FINAL_STATUSES.includes(status);
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_DESCRIPTIONS = {
  [PAYMENT_STATUS.PENDING]: "Payment is pending",
  [PAYMENT_STATUS.PAID]: "Payment has been completed",
  [PAYMENT_STATUS.REFUNDED]: "Payment has been refunded",
  [PAYMENT_STATUS.FAILED]: "Payment has failed",
} as const;
