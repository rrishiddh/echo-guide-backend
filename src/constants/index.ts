

export * from "./roles";
export * from "./bookingStatus";

export {
  PAYMENT_STATUS,
  PaymentStatus,
  PAYMENT_STATUS_DESCRIPTIONS,
} from "./paymentStatus";

export * from "./tourCategories";



export const APP_CONSTANTS = {
  APP_NAME: "Echo Guide",
  APP_VERSION: "1.0.0",
  APP_DESCRIPTION: "Connect travelers with local guides",
  
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  
  MAX_FILE_SIZE: 5 * 1024 * 1024, 
  MAX_IMAGES_PER_LISTING: 10,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_REVIEW_LENGTH: 10,
  MAX_REVIEW_LENGTH: 1000,
  MIN_DESCRIPTION_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 2000,
  
  MIN_BOOKING_ADVANCE_HOURS: 24, 
  MAX_BOOKING_DURATION: 240, 
  REVIEW_WINDOW_DAYS: 30, 
  EDIT_REVIEW_WINDOW_DAYS: 7, 
  
  MIN_RATING: 1,
  MAX_RATING: 5,
  
  MIN_TOUR_FEE: 0,
  MAX_TOUR_FEE: 100000,
  MIN_GROUP_SIZE: 1,
  MAX_GROUP_SIZE: 50,
  MIN_DURATION: 1, 
  MAX_DURATION: 240, 
  
  TOKEN_EXPIRY: "10d",
  REFRESH_TOKEN_EXPIRY: "30d",
  PASSWORD_RESET_EXPIRY: 3600000, 
  OTP_LENGTH: 6,
  OTP_EXPIRY: 600000, 
  
  AUTO_HIDE_REPORT_THRESHOLD: 5, 
  
  DATE_FORMAT: "YYYY-MM-DD",
  TIME_FORMAT: "HH:mm",
  DATETIME_FORMAT: "YYYY-MM-DD HH:mm:ss",
} as const;


export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;


export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "Authentication required",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token",
  ACCOUNT_INACTIVE: "Your account is inactive",
  ACCOUNT_NOT_VERIFIED: "Please verify your account",
  
  FORBIDDEN: "You don't have permission to perform this action",
  INSUFFICIENT_PRIVILEGES: "Insufficient privileges",
  
  VALIDATION_ERROR: "Validation failed",
  INVALID_INPUT: "Invalid input provided",
  REQUIRED_FIELD: "This field is required",
  
  NOT_FOUND: "Resource not found",
  ALREADY_EXISTS: "Resource already exists",
  CONFLICT: "Resource conflict",
  
  INTERNAL_ERROR: "Internal server error",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable",
  
  TOO_MANY_REQUESTS: "Too many requests, please try again later",
} as const;


export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTER_SUCCESS: "Registration successful",
  PASSWORD_CHANGED: "Password changed successfully",
  
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  RETRIEVED: "Retrieved successfully",
  
  BOOKING_CREATED: "Booking request sent successfully",
  BOOKING_CONFIRMED: "Booking confirmed",
  BOOKING_CANCELLED: "Booking cancelled",
  BOOKING_COMPLETED: "Booking completed",
  
  PAYMENT_SUCCESS: "Payment successful",
  REFUND_SUCCESS: "Refund processed successfully",
  
  REVIEW_SUBMITTED: "Review submitted successfully",
  REVIEW_UPDATED: "Review updated successfully",
  
  OPERATION_SUCCESS: "Operation completed successfully",
} as const;


export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE: /^[\d\s\-\+\(\)]+$/,
  URL: /^https?:\/\/.+/,
  TIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
} as const;


export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;


export const ENVIRONMENT = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
  STAGING: "staging",
} as const;


export const isProduction = (): boolean => {
  return process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;
};


export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT;
};


export const isTest = (): boolean => {
  return process.env.NODE_ENV === ENVIRONMENT.TEST;
};