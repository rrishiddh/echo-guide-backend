import mongoose from "mongoose";
import app from "./app";
import config from "./config";

const PORT = config.port || 5000;

async function serverCall() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

serverCall();
