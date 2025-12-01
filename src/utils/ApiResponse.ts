import { Response } from "express";

type Meta = {
  [key: string]: any;
} | null;

export const successResponse = (res: Response, data: any = null, message = "Success", meta: Meta = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const errorResponse = (res: Response, message = "Error", statusCode = 500, errors: any = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
