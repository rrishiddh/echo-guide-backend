import { Document,Types } from "mongoose";


export enum UserRole {
  TOURIST = "tourist",
  GUIDE = "guide",
  ADMIN = "admin",
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profilePic?: string;
  bio?: string;
  languagesSpoken?: string[];
  isVerified: boolean;
  isActive: boolean;
  
  expertise?: string[];
  dailyRate?: number;
  
  travelPreferences?: string[];
  
  
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}


export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  bio?: string;
  languagesSpoken?: string[];
  expertise?: string[];
  dailyRate?: number;
  travelPreferences?: string[];
}


export interface ILoginRequest {
  email: string;
  password: string;
}


export interface ILoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    profilePic?: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}


export interface IRefreshTokenRequest {
  refreshToken: string;
}


export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}


export interface IForgotPasswordRequest {
  email: string;
}


export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}