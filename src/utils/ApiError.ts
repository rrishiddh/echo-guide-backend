import httpStatus from "http-status";

export default class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number = httpStatus.INTERNAL_SERVER_ERROR, message = "Something went wrong", isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this);
  }
}
