import mongoose from "mongoose";
import config from "./index";
import { logger } from "./logger";

const mongooseOptions: mongoose.ConnectOptions = {
  autoIndex: true, 
  maxPoolSize: 10, 
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000, 
  family: 4, 
};

mongoose.connection.on("connected", () => {
  logger.info("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  logger.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Mongoose disconnected from MongoDB");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("Mongoose connection closed due to app termination");
  process.exit(0);
});

export const connectDatabase = async (retries = 5): Promise<void> => {
  try {
    await mongoose.connect(config.database_url, mongooseOptions);
    logger.info("Database connection established successfully");
  } catch (error) {
    logger.error(`Database connection failed. Retries left: ${retries - 1}`);
    
    if (retries > 0) {
      logger.info(`Retrying in 5 seconds...`);
      setTimeout(() => connectDatabase(retries - 1), 5000);
    } else {
      logger.error("Could not connect to database after multiple attempts");
      process.exit(1);
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error closing database connection:", error);
  }
};

if (config.env === "development") {
  mongoose.set("debug", true);
}

export default {
  connect: connectDatabase,
  disconnect: disconnectDatabase,
};