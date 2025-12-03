import mongoose, { Schema } from "mongoose";
import { IBooking, BookingStatus, PaymentStatus } from "./booking.interface";

const bookingSchema = new Schema<IBooking>(
  {
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
    listingId: {
      type: String,
      ref: "Listing",
      required: [true, "Listing ID is required"],
      index: true,
    },
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
      index: true,
      validate: {
        validator: function (value: Date) {
          return value >= new Date();
        },
        message: "Booking date must be in the future",
      },
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"],
    },
    numberOfPeople: {
      type: Number,
      required: [true, "Number of people is required"],
      min: [1, "Number of people must be at least 1"],
      max: [50, "Number of people cannot exceed 50"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    paymentIntentId: {
      type: String,
      default: null,
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
      default: "",
    },
    cancellationReason: {
      type: String,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
      default: null,
    },
    cancelledBy: {
      type: String,
      ref: "User",
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  toJSON: {
  virtuals: true,
  transform: function (_doc, ret: any) {
    if ("__v" in ret) delete (ret as any).__v;
    return ret;
  },
},

    toObject: {
      virtuals: true,
    },
  }
);

bookingSchema.index({ touristId: 1, status: 1 });
bookingSchema.index({ guideId: 1, status: 1 });
bookingSchema.index({ listingId: 1, bookingDate: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ createdAt: -1 });

bookingSchema.virtual("tourist", {
  ref: "User",
  localField: "touristId",
  foreignField: "_id",
  justOne: true,
});

bookingSchema.virtual("guide", {
  ref: "User",
  localField: "guideId",
  foreignField: "_id",
  justOne: true,
});

bookingSchema.virtual("listing", {
  ref: "Listing",
  localField: "listingId",
  foreignField: "_id",
  justOne: true,
});

bookingSchema.pre("save", async function () {
  if (this.isNew && this.listingId) {
    try {
      const Listing = mongoose.model("Listing");
      const listing = await Listing.findById(this.listingId);

      if (listing && listing.duration) {
        const [hours, minutes] = this.startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + listing.duration * 60;

        const endHours = Math.floor(endMinutes / 60) % 24;
        const endMins = endMinutes % 60;

        this.endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
      }
    } catch (error) {
    }
  }
});


bookingSchema.statics.findUpcoming = function (userId: string, role: "tourist" | "guide") {
  const field = role === "tourist" ? "touristId" : "guideId";
  return this.find({
    [field]: userId,
    bookingDate: { $gte: new Date() },
    status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
  }).sort({ bookingDate: 1 });
};

bookingSchema.statics.findPast = function (userId: string, role: "tourist" | "guide") {
  const field = role === "tourist" ? "touristId" : "guideId";
  return this.find({
    [field]: userId,
    $or: [
      { bookingDate: { $lt: new Date() } },
      { status: { $in: [BookingStatus.COMPLETED, BookingStatus.CANCELLED] } },
    ],
  }).sort({ bookingDate: -1 });
};

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;