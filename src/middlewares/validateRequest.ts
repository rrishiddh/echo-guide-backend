import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodObject } from "zod";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { logger } from "../config/logger";

type ValidationSource = "body" | "query" | "params";

export const validateRequest = (
  schema: ZodObject<any>,
  source: ValidationSource = "body"
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];
      const validated = await schema.parseAsync(dataToValidate);

      switch (source) {
        case "body":
          (req as any).validatedBody = validated;
          break;
        case "query":
          (req as any).validatedQuery = validated;
          break;
        case "params":
          (req as any).validatedParams = validated;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        logger.error("Validation error:", formattedErrors);

        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            "Validation failed",
            true,
            formattedErrors
          )
        );
      }
      next(error);
    }
  };
};


export const validateBody = (schema: z.ZodObject<any>) =>
  validateRequest(schema, "body");

export const validateQuery = (schema: z.ZodObject<any>) =>
  validateRequest(schema, "query");

export const validateParams = (schema: z.ZodObject<any>) =>
  validateRequest(schema, "params");

export const validateMultiple = (schemas: {
  body?: z.ZodObject<any>;
  query?: z.ZodObject<any>;
  params?: z.ZodObject<any>;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const errors: any[] = [];

      if (schemas.body) {
        try {
          const validated = await schemas.body.parseAsync(req.body);
          (req as any).validatedBody = validated;
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.issues.map((err) => ({
                source: "body",
                field: err.path.join("."),
                message: err.message,
              }))
            );
          }
        }
      }

      if (schemas.query) {
        try {
          const validated = await schemas.query.parseAsync(req.query);
          (req as any).validatedQuery = validated;
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.issues.map((err) => ({
                source: "query",
                field: err.path.join("."),
                message: err.message,
              }))
            );
          }
        }
      }

      if (schemas.params) {
        try {
          const validated = await schemas.params.parseAsync(req.params);
          (req as any).validatedParams = validated;
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.issues.map((err) => ({
                source: "params",
                field: err.path.join("."),
                message: err.message,
              }))
            );
          }
        }
      }

      if (errors.length > 0) {
        logger.error("Multiple validation errors:", errors);
        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            "Validation failed",
            true,
            errors
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};


export default validateRequest;