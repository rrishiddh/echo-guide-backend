import mongoose, { Schema } from "mongoose";
import { IUser, UserRole } from "./auth.interface";
import { hashPassword, comparePassword } from "../../utils/hashPassword";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.TOURIST,
      required: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
      index: true,
    },

    profilePic: { type: String, default: null },

    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },

    languagesSpoken: {
      type: [String],
      default: [],
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    expertise: {
      type: [String],
      validate: {
        validator: function (this: IUser, value: string[] | undefined) {
          return !(
            this.role === UserRole.GUIDE &&
            (!value || value.length === 0)
          );
        },
        message: "Expertise is required for guides",
      },
    },

    dailyRate: {
      type: Number,
      min: [0, "Daily rate cannot be negative"],
      validate: {
        validator: function (this: IUser, value: number | undefined) {
          return !(this.role === UserRole.GUIDE && !value);
        },
        message: "Daily rate is required for guides",
      },
    },

    travelPreferences: {
      type: [String],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password!);
};

userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select("+password");
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
