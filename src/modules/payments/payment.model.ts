import mongoose, { Schema } from "mongoose";
import {
  IPayment,
  PaymentMethod,
  PaymentStatus,
  TransactionType,
} from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: String,
      ref: "Booking",
      required: [true, "Booking ID is required"],
      index: true,
    },
    touristId: {
      type: String,
      ref: "User",
      required: [true, "Tourist ID is required"],
      index: true,
    },
    guideId: {
      type: String,
      ref: "User",
      required: [true, "Guide ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "usd",
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.STRIPE,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      default: TransactionType.PAYMENT,
      index: true,
    },

    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    clientSecret: {
      type: String,
      select: false,
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },

    refundAmount: {
      type: Number,
      min: [0, "Refund amount cannot be negative"],
      default: null,
    },
    refundReason: {
      type: String,
      maxlength: [500, "Refund reason cannot exceed 500 characters"],
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    failureReason: {
      type: String,
      maxlength: [500, "Failure reason cannot exceed 500 characters"],
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        delete ret.__v;
        delete ret.clientSecret;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

paymentSchema.index({ bookingId: 1, status: 1 });
paymentSchema.index({ touristId: 1, status: 1 });
paymentSchema.index({ guideId: 1, status: 1 });
paymentSchema.index({ status: 1, transactionType: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ processedAt: -1 });

paymentSchema.virtual("booking", {
  ref: "Booking",
  localField: "bookingId",
  foreignField: "_id",
  justOne: true,
});

paymentSchema.virtual("tourist", {
  ref: "User",
  localField: "touristId",
  foreignField: "_id",
  justOne: true,
});

paymentSchema.virtual("guide", {
  ref: "User",
  localField: "guideId",
  foreignField: "_id",
  justOne: true,
});

paymentSchema.pre<IPayment>("save", function () {
  if (
    this.isModified("status") &&
    (this.status === PaymentStatus.COMPLETED ||
      this.status === PaymentStatus.FAILED) &&
    !this.processedAt
  ) {
    this.processedAt = new Date();
  }
});



paymentSchema.statics.calculateRevenue = async function (
  guideId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const match: any = {
    status: PaymentStatus.COMPLETED,
    transactionType: TransactionType.PAYMENT,
  };

  if (guideId) {
    match.guideId = guideId;
  }

  if (startDate || endDate) {
    match.processedAt = {};
    if (startDate) {
      match.processedAt.$gte = startDate;
    }
    if (endDate) {
      match.processedAt.$lte = endDate;
    }
  }

  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, count: 0 };
};

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
