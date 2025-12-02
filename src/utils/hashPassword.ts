import bcrypt from "bcryptjs";
import config from "../config";
import { logger } from "../config/logger";
import ApiError from "./ApiError";
import httpStatus from "http-status";


export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = config.bcrypt_salt_rounds;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    logger.error("Password hashing error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to hash password"
    );
  }
};


export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.error("Password comparison error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to verify password"
    );
  }
};


export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  message: string;
} => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: "Password must not exceed 128 characters",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return {
    isValid: true,
    message: "Password is strong",
  };
};


export const generateRandomPassword = (length: number = 12): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}";
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = "";
  
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

export const needsRehash = (hashedPassword: string): boolean => {
  try {
    const currentRounds = bcrypt.getRounds(hashedPassword);
    return currentRounds !== config.bcrypt_salt_rounds;
  } catch (error) {
    logger.error("Check rehash error:", error);
    return false;
  }
};

export default {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateRandomPassword,
  needsRehash,
};