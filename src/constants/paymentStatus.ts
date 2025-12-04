
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
  CANCELLED: "cancelled",
} as const;


export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];


export const PAYMENT_STATUS_DESCRIPTIONS = {
  [PAYMENT_STATUS.PENDING]: "Payment is pending and awaiting confirmation",
  [PAYMENT_STATUS.PROCESSING]: "Payment is being processed",
  [PAYMENT_STATUS.COMPLETED]: "Payment has been successfully completed",
  [PAYMENT_STATUS.FAILED]: "Payment has failed",
  [PAYMENT_STATUS.REFUNDED]: "Payment has been fully refunded",
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: "Payment has been partially refunded",
  [PAYMENT_STATUS.CANCELLED]: "Payment has been cancelled",
} as const;


export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: "warning",
  [PAYMENT_STATUS.PROCESSING]: "info",
  [PAYMENT_STATUS.COMPLETED]: "success",
  [PAYMENT_STATUS.FAILED]: "error",
  [PAYMENT_STATUS.REFUNDED]: "default",
  [PAYMENT_STATUS.PARTIALLY_REFUNDED]: "warning",
  [PAYMENT_STATUS.CANCELLED]: "error",
} as const;


export const PAYMENT_METHOD = {
  STRIPE: "stripe",
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  WALLET: "wallet",
} as const;


export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];


export const PAYMENT_METHOD_DESCRIPTIONS = {
  [PAYMENT_METHOD.STRIPE]: "Stripe payment gateway",
  [PAYMENT_METHOD.CARD]: "Credit/Debit card",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Bank transfer",
  [PAYMENT_METHOD.WALLET]: "Digital wallet",
} as const;


export const TRANSACTION_TYPE = {
  PAYMENT: "payment",
  REFUND: "refund",
  PAYOUT: "payout",
} as const;


export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

export const TRANSACTION_TYPE_DESCRIPTIONS = {
  [TRANSACTION_TYPE.PAYMENT]: "Payment from tourist to platform",
  [TRANSACTION_TYPE.REFUND]: "Refund from platform to tourist",
  [TRANSACTION_TYPE.PAYOUT]: "Payout from platform to guide",
} as const;


export const CURRENCY = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  JPY: "JPY",
  AUD: "AUD",
  CAD: "CAD",
} as const;


export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];


export const CURRENCY_SYMBOLS = {
  [CURRENCY.USD]: "$",
  [CURRENCY.EUR]: "€",
  [CURRENCY.GBP]: "£",
  [CURRENCY.JPY]: "¥",
  [CURRENCY.AUD]: "A$",
  [CURRENCY.CAD]: "C$",
} as const;


export const getCurrencySymbol = (currency: Currency): string => {
  return CURRENCY_SYMBOLS[currency] || currency;
};


export const formatAmount = (amount: number, currency: Currency = CURRENCY.USD): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};


export const SUCCESSFUL_PAYMENT_STATUSES = [
  PAYMENT_STATUS.COMPLETED,
] as const;


export const FAILED_PAYMENT_STATUSES = [
  PAYMENT_STATUS.FAILED,
  PAYMENT_STATUS.CANCELLED,
] as const;


export const REFUNDABLE_PAYMENT_STATUSES = [
  PAYMENT_STATUS.COMPLETED,
] as const;


export const isSuccessfulPayment = (status: PaymentStatus): boolean => {
  return SUCCESSFUL_PAYMENT_STATUSES.includes(status as any);
};


export const isFailedPayment = (status: PaymentStatus): boolean => {
  return FAILED_PAYMENT_STATUSES.includes(status as any);
};


export const isRefundablePayment = (status: PaymentStatus): boolean => {
  return REFUNDABLE_PAYMENT_STATUSES.includes(status as any);
};


export const PLATFORM_FEE_PERCENTAGE = 10; 


export const calculatePlatformFee = (amount: number): number => {
  return (amount * PLATFORM_FEE_PERCENTAGE) / 100;
};


export const calculateGuidePayout = (amount: number): number => {
  return amount - calculatePlatformFee(amount);
};