// src/middlewares/notFound.ts
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`));
};

export default notFound;
