import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // Set strictQuery option to avoid deprecation warning
    mongoose.set("strictQuery", false);

    // Connection options for performance optimization
    const options = {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5,
      maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS) || 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      //console.log('MongoDB disconnected');
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        //console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
