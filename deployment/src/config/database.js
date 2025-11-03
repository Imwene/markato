import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (retries = 3, delay = 5000) => {
  try {
    // Set strictQuery option to avoid deprecation warning
    mongoose.set("strictQuery", false);

    // Connection options for performance optimization
    const options = {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 2, // Reduced from 5
      maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS) || 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Disable automatic retries to prevent memory buildup
      retryWrites: false,
      retryReads: false,
      autoIndex: false,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Handle connection events - use 'once' to prevent multiple listeners
    mongoose.connection.once("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    mongoose.connection.once("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    const attempt = 4 - retries;
    console.error(
      `MongoDB connection failed (attempt ${attempt}/3):`,
      error.message
    );

    if (retries > 0) {
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retries - 1, delay);
    }

    console.error("Failed to connect to MongoDB after 3 attempts.");
    console.error("Please check:");
    console.error(
      "1. MongoDB Atlas IP whitelist includes:",
      process.env.SERVER_IP || "your server IP"
    );
    console.error("2. MongoDB URI is correct");
    console.error("3. Network connectivity");
    console.error(
      "\nExiting to prevent memory exhaustion from infinite retries..."
    );
    process.exit(1);
  }
};

export default connectDB;
