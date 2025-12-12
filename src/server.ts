import app from "./app";
import config from "./config";
import { logger } from "./config/logger";
import { connectDatabase } from "./config/database";
import mongoose from "mongoose";

const PORT = config.port || 5000;

async function serverCall() {
  try {
    // Connect to MongoDB before starting the server
    await connectDatabase();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, closing server...`);
      server.close(async () => {
        try {
          await mongoose.disconnect();
          logger.info("MongoDB disconnected");
          logger.info("Server closed gracefully");
          process.exit(0);
        } catch (err) {
          logger.error("Error during shutdown:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

serverCall();
