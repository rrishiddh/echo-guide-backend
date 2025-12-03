import { z } from "zod";
import { UserRole } from "./auth.interface";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  );

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z
      .nativeEnum(UserRole)
      .refine((val) => Object.values(UserRole).includes(val), {
        message: "Role must be tourist, guide, or admin",
      }),
    bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
    languagesSpoken: z
      .array(z.string())
      .max(10, "Cannot specify more than 10 languages")
      .optional(),
    expertise: z
      .array(z.string())
      .min(1, "At least one expertise is required for guides")
      .max(20, "Cannot specify more than 20 expertise areas")
      .optional(),
    dailyRate: z
      .number()
      .positive("Daily rate must be positive")
      .max(10000, "Daily rate seems unreasonably high")
      .optional(),
    travelPreferences: z
      .array(z.string())
      .max(20, "Cannot specify more than 20 travel preferences")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === UserRole.GUIDE) {
        return data.expertise && data.expertise.length > 0 && data.dailyRate;
      }
      return true;
    },
    {
      message: "Guides must provide expertise and daily rate",
      path: ["role"],
    }
  );

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});
