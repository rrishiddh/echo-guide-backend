import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import { errorResponse } from "../utils/ApiResponse";

const globalErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return errorResponse(res, err.message, err.statusCode, { isOperational: err.isOperational });
  }

  if (err?.name === "ZodError" && err?.issues) {
    const formatted = err.issues.map((i: any) => ({ path: i.path.join("."), message: i.message }));
    return errorResponse(res, "Validation error", httpStatus.BAD_REQUEST, formatted);
  }

  if (err?.name === "ValidationError") {
    const errors = Object.keys(err.errors).map((key) => ({
      path: key,
      message: err.errors[key].message,
    }));
    return errorResponse(res, "Database validation error", httpStatus.BAD_REQUEST, errors);
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return errorResponse(res, "Authentication error", httpStatus.UNAUTHORIZED, { name: err.name, message: err.message });
  }

  console.error("Unhandled Error:", err);
  return errorResponse(res, "Internal server error", httpStatus.INTERNAL_SERVER_ERROR, null);
};

export default globalErrorHandler;
