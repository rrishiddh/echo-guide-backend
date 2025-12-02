import { logger } from "../config/logger";
import ApiError from "./ApiError";
import httpStatus from "http-status";


export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


export const generateRandomString = (
  length: number = 10,
  chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


export const generateUniqueId = (): string => {
  return `${Date.now()}-${generateRandomString(8)}`;
};


export const paginateArray = <T>(
  array: T[],
  page: number = 1,
  limit: number = 10
) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    meta: {
      total: array.length,
      page,
      limit,
      totalPages: Math.ceil(array.length / limit),
    },
  };
};


export const calculatePagination = (
  total: number,
  page: number = 1,
  limit: number = 10
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

export const parsePaginationParams = (query: any): {
  page: number;
  limit: number;
  skip: number;
} => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") 
    .trim();
};


export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") 
    .replace(/\s+/g, "-") 
    .replace(/--+/g, "-") 
    .trim();
};


export const formatPrice = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};


export const calculatePercentage = (
  value: number,
  total: number,
  decimals: number = 2
): number => {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
};


export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};


export const removeEmptyFields = <T extends Record<string, any>>(
  obj: T
): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};


export const formatDate = (
  date: Date | string,
  locale: string = "en-US"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};


export const getTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);
  
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }
  
  return "just now";
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};


export const parseSortQuery = (sortQuery?: string): Record<string, 1 | -1> => {
  if (!sortQuery) return { createdAt: -1 };
  
  const sortObj: Record<string, 1 | -1> = {};
  
  sortQuery.split(",").forEach((field) => {
    if (field.startsWith("-")) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });
  
  return sortObj;
};


export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};


export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};


export const generateOTP = (length: number = 6): string => {
  const digits = "0123456789";
  let otp = "";
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};


export const isDateInPast = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
};


export const isDateInFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    logger.warn(`Retry attempt ${4 - retries} failed, retrying in ${delay}ms...`);
    await sleep(delay);
    
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

export default {
  sleep,
  generateRandomString,
  generateUniqueId,
  paginateArray,
  calculatePagination,
  parsePaginationParams,
  sanitizeInput,
  slugify,
  formatPrice,
  calculatePercentage,
  deepClone,
  removeEmptyFields,
  formatDate,
  getTimeAgo,
  isValidEmail,
  isValidObjectId,
  parseSortQuery,
  capitalizeFirst,
  truncateText,
  generateOTP,
  isDateInPast,
  isDateInFuture,
  addDays,
  retryWithBackoff,
};