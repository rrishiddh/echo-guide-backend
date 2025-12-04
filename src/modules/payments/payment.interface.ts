import { Document,Types } from "mongoose";


export enum PaymentMethod {
  STRIPE = "stripe",
  CARD = "card",
  BANK_TRANSFER = "bank_transfer",
  WALLET = "wallet",
}


export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
  CANCELLED = "cancelled",
}


export enum TransactionType {
  PAYMENT = "payment",
  REFUND = "refund",
  PAYOUT = "payout",
}


export interface IPayment extends Document {
  _id:  Types.ObjectId;
  bookingId: string;
  touristId: string;
  guideId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionType: TransactionType;
  
  paymentIntentId?: string;
  clientSecret?: string;
  stripeCustomerId?: string;
  
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  
  metadata?: Record<string, any>;
  failureReason?: string;
  processedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}


export interface ICreatePaymentIntentRequest {
  bookingId: string;
  amount?: number; 
}


export interface IConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}


export interface IRefundPaymentRequest {
  paymentId: string;
  amount?: number; 
  reason: string;
}


export interface IPaymentQuery {
  touristId?: string;
  guideId?: string;
  bookingId?: string;
  status?: PaymentStatus;
  transactionType?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
}


export interface IPaymentListResponse {
  payments: IPayment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalAmount: number;
  };
}


export interface IPaymentStats {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  completedAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  refundedPayments: number;
  refundedAmount: number;
  failedPayments: number;
  paymentsByStatus: {
    status: string;
    count: number;
    amount: number;
  }[];
  paymentsByMethod: {
    method: string;
    count: number;
    amount: number;
  }[];
  recentPayments: IPayment[];
}

export interface IPayoutRequest {
  guideId: string;
  amount: number;
  method: string;
}


export interface IWebhookEvent {
  type: string;
  data: any;
}