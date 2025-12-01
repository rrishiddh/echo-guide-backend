import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import { errorResponse } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import config from "../config";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`Error on ${req.method} ${req.path}:`, {
    message: err.message,
    stack: config.env === "development" ? err.stack : undefined,
  });

  if (err instanceof ApiError) {
    return errorResponse(res, err.message, err.statusCode, {
      isOperational: err.isOperational,
    });
  }

  if (err?.name === "ZodError" && err?.issues) {
    const formatted = err.issues.map((i: any) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return errorResponse(
      res,
      "Validation error",
      httpStatus.BAD_REQUEST,
      formatted
    );
  }

  if (err?.name === "ValidationError") {
    const errors = Object.keys(err.errors).map((key) => ({
      path: key,
      message: err.errors[key].message,
    }));
    return errorResponse(
      res,
      "Database validation error",
      httpStatus.BAD_REQUEST,
      errors
    );
  }

  if (err?.name === "CastError") {
    return errorResponse(
      res,
      `Invalid ${err.path}: ${err.value}`,
      httpStatus.BAD_REQUEST,
      null
    );
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return errorResponse(
      res,
      `${field} already exists`,
      httpStatus.CONFLICT,
      null
    );
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return errorResponse(
      res,
      err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
      httpStatus.UNAUTHORIZED,
      { name: err.name, message: err.message }
    );
  }

  logger.error("Unhandled Error:", err);
  return errorResponse(
    res,
    config.env === "development" ? err.message : "Internal server error",
    httpStatus.INTERNAL_SERVER_ERROR,
    config.env === "development" ? { stack: err.stack } : null
  );
};

export default globalErrorHandler;