import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { logger } from "../config/logger";


const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];


const MAX_FILE_SIZE = 5 * 1024 * 1024; 


const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid file type. Only ${ALLOWED_IMAGE_TYPES.join(", ")} are allowed.`
      )
    );
  }
};


const storage = multer.memoryStorage();


const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: imageFileFilter,
});


export const uploadSingle = (fieldName: string = "image") => {
  return (req: Request, res: any, next: any) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (error: any) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(
              httpStatus.BAD_REQUEST,
              `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
            )
          );
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            new ApiError(
              httpStatus.BAD_REQUEST,
              `Unexpected field name. Expected '${fieldName}'.`
            )
          );
        }

        logger.error("Multer error:", error);
        return next(
          new ApiError(httpStatus.BAD_REQUEST, `Upload error: ${error.message}`)
        );
      }

      if (error) {
        return next(error);
      }

      next();
    });
  };
};


export const uploadMultiple = (fieldName: string = "images", maxCount: number = 10) => {
  return (req: Request, res: any, next: any) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (error: any) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(
              httpStatus.BAD_REQUEST,
              `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB per file.`
            )
          );
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          return next(
            new ApiError(
              httpStatus.BAD_REQUEST,
              `Too many files. Maximum is ${maxCount} files.`
            )
          );
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            new ApiError(
              httpStatus.BAD_REQUEST,
              `Unexpected field name. Expected '${fieldName}'.`
            )
          );
        }

        logger.error("Multer error:", error);
        return next(
          new ApiError(httpStatus.BAD_REQUEST, `Upload error: ${error.message}`)
        );
      }

      if (error) {
        return next(error);
      }

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return next(
          new ApiError(httpStatus.BAD_REQUEST, "No files uploaded")
        );
      }

      next();
    });
  };
};


export const uploadFields = (
  fields: { name: string; maxCount: number }[]
) => {
  return (req: Request, res: any, next: any) => {
    const uploadMiddleware = upload.fields(fields);

    uploadMiddleware(req, res, (error: any) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(
              httpStatus.BAD_REQUEST,
              `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
            )
          );
        }

        logger.error("Multer error:", error);
        return next(
          new ApiError(httpStatus.BAD_REQUEST, `Upload error: ${error.message}`)
        );
      }

      if (error) {
        return next(error);
      }

      next();
    });
  };
};


export const uploadSingleOptional = (fieldName: string = "image") => {
  return (req: Request, res: any, next: any) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (error: any) => {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(
              httpStatus.BAD_REQUEST,
              `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
            )
          );
        }

        logger.error("Multer error:", error);
        return next(
          new ApiError(httpStatus.BAD_REQUEST, `Upload error: ${error.message}`)
        );
      }

      if (error && !(error instanceof ApiError)) {
        return next(error);
      }

      next();
    });
  };
};

export const getFileExtension = (mimetype: string): string => {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };

  return mimeToExt[mimetype] || "";
};


export const bufferToDataURL = (buffer: Buffer, mimetype: string): string => {
  const base64 = buffer.toString("base64");
  return `data:${mimetype};base64,${base64}`;
};


export const processUploadedFile = (file: Express.Multer.File): string => {
  if (!file || !file.buffer) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file provided");
  }

  return bufferToDataURL(file.buffer, file.mimetype);
};


export const processUploadedFiles = (files: Express.Multer.File[]): string[] => {
  if (!files || files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No files provided");
  }

  return files.map((file) => processUploadedFile(file));
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadSingleOptional,
  processUploadedFile,
  processUploadedFiles,
  getFileExtension,
  bufferToDataURL,
};