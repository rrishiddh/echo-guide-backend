import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { verifyAccessToken, extractTokenFromHeader, TokenPayload } from "../utils/generateToken";
import { logger } from "../config/logger";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}


export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Authentication required. Please provide a valid token."
      );
    }

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error: any) {
    logger.error("Authentication error:", error.message);
    
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          httpStatus.UNAUTHORIZED,
          "Invalid or expired token. Please login again."
        )
      );
    }
  }
};


export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }

    next();
  } catch (error: any) {
    logger.warn("Optional auth token invalid:", error.message);
    next();
  }
};


export const isAuthenticated = (req: Request): boolean => {
  return !!req.user;
};


export const getCurrentUser = (req: Request): TokenPayload | null => {
  return req.user || null;
};

export default authenticate;