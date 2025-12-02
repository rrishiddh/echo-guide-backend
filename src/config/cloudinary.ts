import { v2 as cloudinary } from "cloudinary";
import config from "./index";
import { logger } from "./logger";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";


const initializeCloudinary = () => {
  if (!config.cloudinary_cloud || !config.cloudinary_key || !config.cloudinary_secret) {
    logger.warn("Cloudinary credentials not found. Image upload will be disabled.");
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: config.cloudinary_cloud,
      api_key: config.cloudinary_key,
      api_secret: config.cloudinary_secret,
      secure: true, 
    });

    logger.info("Cloudinary initialized successfully");
    return true;
  } catch (error) {
    logger.error("Failed to initialize Cloudinary:", error);
    return false;
  }
};

const isCloudinaryEnabled = initializeCloudinary();


export const uploadToCloudinary = async (
  file: string,
  folder: string = "echo-guide"
): Promise<{ url: string; publicId: string }> => {
  if (!isCloudinaryEnabled) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Image upload service is not available"
    );
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 800, crop: "limit" }, 
        { quality: "auto", fetch_format: "auto" }, 
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    logger.error("Cloudinary upload error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Image upload failed: ${error.message}`
    );
  }
};


export const uploadMultipleToCloudinary = async (
  files: string[],
  folder: string = "echo-guide"
): Promise<{ url: string; publicId: string }[]> => {
  if (!isCloudinaryEnabled) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Image upload service is not available"
    );
  }

  try {
    const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    logger.error("Multiple image upload error:", error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to upload images: ${error.message}`
    );
  }
};


export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!isCloudinaryEnabled) {
    logger.warn("Cloudinary not enabled, skipping image deletion");
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted from Cloudinary: ${publicId}`);
  } catch (error: any) {
    logger.error("Cloudinary delete error:", error);
  }
};

export const deleteMultipleFromCloudinary = async (
  publicIds: string[]
): Promise<void> => {
  if (!isCloudinaryEnabled) {
    logger.warn("Cloudinary not enabled, skipping image deletion");
    return;
  }

  try {
    await cloudinary.api.delete_resources(publicIds);
    logger.info(`Deleted ${publicIds.length} images from Cloudinary`);
  } catch (error: any) {
    logger.error("Cloudinary bulk delete error:", error);
  }
};

export const getCloudinaryImageDetails = async (publicId: string) => {
  if (!isCloudinaryEnabled) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Image service is not available"
    );
  }

  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error: any) {
    logger.error("Cloudinary get details error:", error);
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Image not found or service unavailable"
    );
  }
};

export default cloudinary;