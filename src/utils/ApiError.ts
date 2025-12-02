import httpStatus from "http-status";

export default class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public data?: any; 

  constructor(
    statusCode: number = httpStatus.INTERNAL_SERVER_ERROR,
    message = "Something went wrong",
    isOperational = true,
    data?: any 
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.data = data;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}