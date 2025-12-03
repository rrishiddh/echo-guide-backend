import { Document } from "mongoose";
import { UserRole } from "../auth/auth.interface";


export interface IUpdateUserRequest {
  name?: string;
  bio?: string;
  languagesSpoken?: string[];
  profilePic?: string;
  
  expertise?: string[];
  dailyRate?: number;
  
  travelPreferences?: string[];
}


export interface IUserQuery {
  role?: UserRole;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}


export interface IUserStats {
  totalUsers: number;
  totalTourists: number;
  totalGuides: number;
  totalAdmins: number;
  verifiedUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface IGuideProfile {
  id: string;
  name: string;
  email: string;
  profilePic?: string;
  bio?: string;
  languagesSpoken?: string[];
  expertise: string[];
  dailyRate: number;
  isVerified: boolean;
  rating?: number;
  totalReviews?: number;
  totalTours?: number;
  createdAt: Date;
}


export interface ITouristProfile {
  id: string;
  name: string;
  profilePic?: string;
  bio?: string;
  travelPreferences?: string[];
  totalBookings?: number;
  createdAt: Date;
}


export interface IUserListResponse {
  users: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}