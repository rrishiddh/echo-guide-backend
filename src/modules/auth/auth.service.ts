import httpStatus from "http-status";
import User from "./auth.model";
import ApiError from "../../utils/ApiError";
import {
  generateTokens,
  verifyRefreshToken,
  TokenPayload,
} from "../../utils/generateToken";
import {
  IRegisterRequest,
  ILoginRequest,
  ILoginResponse,
  IChangePasswordRequest,
  UserRole,
} from "./auth.interface";
import { logger } from "../../config/logger";
import { connectDatabase } from "../../config/database";

const register = async (payload: IRegisterRequest): Promise<ILoginResponse> => {
  await connectDatabase();

  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User with this email already exists"
    );
  }

  const user = await User.create(payload);

  const tokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role as UserRole,
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  logger.info(`New user registered: ${user.email}`);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};

const login = async (payload: ILoginRequest): Promise<ILoginResponse> => {
  await connectDatabase();

  const user = await User.findOne({ email: payload.email }).select("+password");

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated. Please contact support."
    );
  }

  const isPasswordValid = await user.comparePassword(payload.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const tokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role as UserRole,
  };

  const { accessToken, refreshToken } = generateTokens(tokenPayload);

  logger.info(`User logged in: ${user.email}`);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  await connectDatabase();

  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "User not found. Please login again."
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your account has been deactivated"
    );
  }

  const tokenPayload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role as UserRole,
  };

  const { accessToken } = generateTokens(tokenPayload);

  return { accessToken };
};

const getProfile = async (userId: string) => {
  await connectDatabase();

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const changePassword = async (
  userId: string,
  payload: IChangePasswordRequest
): Promise<void> => {
  await connectDatabase();

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordValid = await user.comparePassword(payload.currentPassword);

  if (!isPasswordValid) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect"
    );
  }

  user.password = payload.newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);
};

const logout = async (userId: string): Promise<void> => {
  logger.info(`User logged out: ${userId}`);
};

const forgotPassword = async (email: string): Promise<void> => {
  await connectDatabase();

  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`Password reset requested for non-existent email: ${email}`);
    return;
  }

  logger.info(`Password reset requested for: ${email}`);
};

const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  logger.info(
    `Password reset attempted with token: ${token.substring(0, 10)}...`
  );

  throw new ApiError(
    httpStatus.NOT_IMPLEMENTED,
    "Password reset not yet implemented"
  );
};

export default {
  register,
  login,
  refreshAccessToken,
  getProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
};
