import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../config";
import { logger } from "../config/logger";
import ApiError from "./ApiError";
import httpStatus from "http-status";
import ms from "ms";


export interface TokenPayload {
  userId: string;
  email: string;
  role: "tourist" | "guide" | "admin";
}


export const generateAccessToken = (payload: TokenPayload): string => {
  try {
    const options: SignOptions = {
      expiresIn: config.jwt_expires  as ms.StringValue,
    };

    const token = jwt.sign(payload, config.jwt_secret, options);
    return token;
  } catch (error) {
    logger.error("Access token generation error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to generate access token"
    );
  }
};


export const generateRefreshToken = (payload: TokenPayload): string => {
  try {
    if (!config.jwt_refresh_secret) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Refresh token secret not configured"
      );
    }

    const options: SignOptions = {
      expiresIn: config.jwt_refresh_expires  as ms.StringValue,
    };

    const token = jwt.sign(payload, config.jwt_refresh_secret, options);
    return token;
  } catch (error) {
    logger.error("Refresh token generation error:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to generate refresh token"
    );
  }
};


export const generateTokens = (payload: TokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};


export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt_secret) as JwtPayload;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error: any) {
    logger.error("Access token verification error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Access token has expired");
    }
    
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid access token");
    }
    
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token verification failed");
  }
};


export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    if (!config.jwt_refresh_secret) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Refresh token secret not configured"
      );
    }

    const decoded = jwt.verify(token, config.jwt_refresh_secret) as JwtPayload;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error: any) {
    logger.error("Refresh token verification error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token has expired");
    }
    
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }
    
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token verification failed");
  }
};


export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    logger.error("Token decode error:", error);
    return null;
  }
};


export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
};