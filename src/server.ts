import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { logger } from "./config/logger";

const PORT = config.port || 5000;

async function serverCall() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info("MongoDB Connected Successfully");

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, closing server...");
      server.close(() => {
        mongoose.connection.close();
        logger.info("Server closed gracefully");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, closing server...");
      server.close(() => {
        mongoose.connection.close();
        logger.info("Server closed gracefully");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

serverCall();