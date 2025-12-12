import httpStatus from "http-status";
import User from "./user.model";
import ApiError from "../../utils/ApiError";
import { connectDatabase } from "../../config/database";
import {
  IUpdateUserRequest,
  IUserQuery,
  IUserStats,
  IUserListResponse,
} from "./user.interface";
import { logger } from "../../config/logger";
import { parsePaginationParams, calculatePagination } from "../../utils/helpers";
import { UserRole } from "../auth/auth.interface";

const getUserById = async (userId: string) => {
  await connectDatabase();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};


const getAllUsers = async (query: IUserQuery): Promise<IUserListResponse> => {
  await connectDatabase();
  const { page = 1, limit = 10, role, isVerified, isActive, search, sortBy = "-createdAt" } = query;

  const filter: any = {};

  if (role) {
    filter.role = role;
  }

  if (isVerified !== undefined) {
    filter.isVerified = isVerified;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const { skip } = parsePaginationParams({ page, limit });

  const sortOrder: any = {};
  if (sortBy.startsWith("-")) {
    sortOrder[sortBy.substring(1)] = -1;
  } else {
    sortOrder[sortBy] = 1;
  }

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .select("-__v");

  const meta = calculatePagination(total, page, limit);

  return {
    users,
    meta,
  };
};


const updateUser = async (
  userId: string,
  payload: IUpdateUserRequest
) => {
  await connectDatabase();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === UserRole.GUIDE) {
    if (payload.expertise !== undefined && payload.expertise.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Guides must have at least one expertise"
      );
    }
    if (payload.dailyRate !== undefined && payload.dailyRate <= 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Daily rate must be positive"
      );
    }
  }

  Object.assign(user, payload);
  await user.save();

  logger.info(`User updated: ${user.email}`);

  return user;
};


const deleteUser = async (userId: string): Promise<void> => {
  await connectDatabase();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isActive = false;
  await user.save();

  logger.info(`User deactivated: ${user.email}`);
};


const permanentlyDeleteUser = async (userId: string): Promise<void> => {
  await connectDatabase();
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  logger.warn(`User permanently deleted: ${user.email}`);
};


const toggleUserStatus = async (
  userId: string,
  isActive: boolean
) => {
  await connectDatabase();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isActive = isActive;
  await user.save();

  logger.info(`User status toggled: ${user.email} - Active: ${isActive}`);

  return user;
};


const verifyUser = async (
  userId: string,
  isVerified: boolean
) => {
  await connectDatabase();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isVerified = isVerified;
  await user.save();

  logger.info(`User verification status updated: ${user.email} - Verified: ${isVerified}`);

  return user;
};


const changeUserRole = async (
  userId: string,
  newRole: UserRole
) => {
  await connectDatabase();
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (newRole === UserRole.GUIDE && (!user.expertise || !user.dailyRate)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot change to guide role without expertise and daily rate"
    );
  }

  user.role = newRole;
  await user.save();

  logger.info(`User role changed: ${user.email} - New role: ${newRole}`);

  return user;
};


const getUserStats = async (): Promise<IUserStats> => {
  await connectDatabase();
  const totalUsers = await User.countDocuments();
  const totalTourists = await User.countDocuments({ role: UserRole.TOURIST });
  const totalGuides = await User.countDocuments({ role: UserRole.GUIDE });
  const totalAdmins = await User.countDocuments({ role: UserRole.ADMIN });
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  const activeUsers = await User.countDocuments({ isActive: true });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  return {
    totalUsers,
    totalTourists,
    totalGuides,
    totalAdmins,
    verifiedUsers,
    activeUsers,
    newUsersThisMonth,
  };
};

const getAllGuides = async (query: IUserQuery): Promise<IUserListResponse> => {
  await connectDatabase();
  const { page = 1, limit = 10, search, sortBy = "-createdAt" } = query;

  const filter: any = {
    role: UserRole.GUIDE,
    isActive: true,
    isVerified: true,
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
      { expertise: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const { skip } = parsePaginationParams({ page, limit });

  const sortOrder: any = {};
  if (sortBy.startsWith("-")) {
    sortOrder[sortBy.substring(1)] = -1;
  } else {
    sortOrder[sortBy] = 1;
  }

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .select("name email profilePic bio languagesSpoken expertise dailyRate isVerified createdAt");

  const meta = calculatePagination(total, page, limit);

  return {
    users,
    meta,
  };
};


const searchGuides = async (filters: {
  languages?: string[];
  expertise?: string[];
  minRate?: number;
  maxRate?: number;
  page?: number;
  limit?: number;
}): Promise<IUserListResponse> => {
  await connectDatabase();
  const { languages, expertise, minRate, maxRate, page = 1, limit = 10 } = filters;

  const filter: any = {
    role: UserRole.GUIDE,
    isActive: true,
    isVerified: true,
  };

  if (languages && languages.length > 0) {
    filter.languagesSpoken = { $in: languages };
  }

  if (expertise && expertise.length > 0) {
    filter.expertise = { $in: expertise };
  }

  if (minRate !== undefined || maxRate !== undefined) {
    filter.dailyRate = {};
    if (minRate !== undefined) {
      filter.dailyRate.$gte = minRate;
    }
    if (maxRate !== undefined) {
      filter.dailyRate.$lte = maxRate;
    }
  }

  const { skip } = parsePaginationParams({ page, limit });

  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .sort({ dailyRate: 1 })
    .skip(skip)
    .limit(limit)
    .select("name email profilePic bio languagesSpoken expertise dailyRate isVerified createdAt");

  const meta = calculatePagination(total, page, limit);

  return {
    users,
    meta,
  };
};

export default {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  permanentlyDeleteUser,
  toggleUserStatus,
  verifyUser,
  changeUserRole,
  getUserStats,
  getAllGuides,
  searchGuides,
};