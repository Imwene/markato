import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // Set strictQuery option to avoid deprecation warning
    mongoose.set("strictQuery", false);

    // Connection pool options for better performance
    const options = {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5,
      maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS) || 60000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      //console.log('MongoDB disconnected');
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    // Note: SIGINT/SIGTERM handlers are managed in server.js to avoid duplicate handlers
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
