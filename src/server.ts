import app from "./app";
import config from "./config";
import { logger } from "./config/logger";
import database from "./config/database";

const PORT = config.port || 5000;

async function serverCall() {
  try {
    await database.connect(); 

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, closing server...");
      server.close(async () => {
        await database.disconnect();
        logger.info("Server closed gracefully");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, closing server...");
      server.close(async () => {
        await database.disconnect();
        logger.info("Server closed gracefully");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

serverCall();
