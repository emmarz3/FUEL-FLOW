import mongoose from "mongoose";
import logger from "./logger";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/fuelflow_africa";
    
    await mongoose.connect(mongoUri);
    
    logger.info("MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error:", error);
    });
    
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
    
    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;

