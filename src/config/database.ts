import mongoose from "mongoose";
import config from "./index";
import { logger } from "./logger";

const CLIENT_URL = config.MONGODB_URI;

if (!CLIENT_URL) {
  throw new Error(" Missing CLIENT_URL in environment variables");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDatabase() {
  if (cached.conn) {
    return cached.conn; 
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(CLIENT_URL, {
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      })
      .then((mongoose) => {
        logger.info("Mongoose connected to MongoDB");
        return mongoose;
      })
      .catch((err) => {
        logger.error("Mongoose connection error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
