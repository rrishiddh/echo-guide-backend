export type UserRole = "tourist" | "guide" | "admin";


export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "rejected";


export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "partially_refunded" | "cancelled";


export type ListingStatus = "active" | "inactive" | "draft";


export type TourCategory =
  | "Food"
  | "Art"
  | "Adventure"
  | "History"
  | "Culture"
  | "Nightlife"
  | "Shopping"
  | "Nature"
  | "Photography"
  | "Sports"
  | "Wellness"
  | "Family";


export type TransactionType = "payment" | "refund" | "payout";


export type PaymentMethod = "stripe" | "card" | "bank_transfer" | "wallet";


export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}


export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta | Record<string, any>;
}


export interface ErrorResponse {
  success: false;
  message: string;
  errors?: any;
  stack?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  [key: string]: any;
}


export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}


export interface Coordinates {
  latitude: number;
  longitude: number;
}


export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates?: Coordinates;
}


export interface FileUpload {
  url: string;
  publicId: string;
  filename?: string;
  mimetype?: string;
  size?: number;
}


export interface RatingBreakdown {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}


export interface Statistics {
  total: number;
  active?: number;
  inactive?: number;
  growth?: number;
  [key: string]: any;
}


export interface Notification {
  id: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}


export interface ActivityLog {
  userId: string;
  action: string;
  entityType: "user" | "listing" | "booking" | "payment" | "review";
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}


export interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  allowBookings: boolean;
  platformFeePercentage: number;
  minBookingAmount: number;
  maxBookingAmount: number;
  [key: string]: any;
}


export interface AvailabilitySlot {
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxCapacity?: number;
  currentBookings?: number;
}


export interface PriceBreakdown {
  basePrice: number;
  serviceFee: number;
  tax: number;
  discount?: number;
  total: number;
  currency: string;
}


export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  averageGuideRating?: number;
  averageCommunicationRating?: number;
  averageValueRating?: number;
  averageExperienceRating?: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}


export interface EarningsSummary {
  totalEarnings: number;
  completedBookings: number;
  pendingEarnings: number;
  averageEarningPerBooking: number;
  earningsByMonth: {
    month: string;
    earnings: number;
    bookings: number;
  }[];
}


export interface DashboardOverview {
  users: {
    total: number;
    tourists: number;
    guides: number;
    active: number;
    verified: number;
  };
  listings: {
    total: number;
    active: number;
    draft: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  payments: {
    totalRevenue: number;
    pendingRevenue: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  growth?: {
    userGrowth: number;
    bookingGrowth: number;
  };
}


export interface SearchFilters {
  query?: string;
  category?: TourCategory | TourCategory[];
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  languages?: string[];
  date?: Date;
  [key: string]: any;
}


export interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}


export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}


export interface EmailTemplateData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}


export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  signature?: string;
}


export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl?: number;
  createdAt: Date;
  expiresAt?: Date;
}


export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
}

export interface Geolocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  accuracy?: number;
}


export interface TimeSlot {
  start: string; 
  end: string;
  available: boolean;
}


export interface Language {
  code: string; 
  name: string; 
  nativeName?: string; 
}


export interface Currency {
  code: string; 
  name: string; 
  symbol: string; 
}


export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}


export interface ContactInfo {
  email: string;
  phone?: string;
  alternatePhone?: string;
  address?: Address;
}


export interface WorkingHours {
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  isOpen: boolean;
  openTime?: string;
  closeTime?: string; 
}


export interface ReviewFilter {
  rating?: number;
  verified?: boolean;
  withPhotos?: boolean;
  language?: string;
  sortBy?: "recent" | "helpful" | "rating_high" | "rating_low";
}


export interface BookingConflict {
  hasConflict: boolean;
  conflictingBookings?: any[];
  reason?: string;
}


export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
}


export interface ReportData {
  reportType: "users" | "bookings" | "revenue" | "listings";
  dateRange: DateRange;
  totalCount: number;
  totalRevenue?: number;
  data: any[];
  generatedAt: Date;
}


export interface AuditTrail {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: {
    before: any;
    after: any;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}


export interface EnvironmentVariables {
  NODE_ENV: "development" | "production" | "test" | "staging";
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET?: string;
  JWT_REFRESH_EXPIRES_IN?: string;
  BCRYPT_SALT_ROUNDS: string;
  CLIENT_URL: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
}


export interface ListResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}


export interface SortOption {
  field: string;
  order: "asc" | "desc";
  label?: string;
}


export interface FilterOption {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains" | "startsWith" | "endsWith";
  value: any;
}


export interface ValidationResult {
  isValid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}


export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export * from "./express";