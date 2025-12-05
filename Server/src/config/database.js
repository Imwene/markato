import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // Set strictQuery option to avoid deprecation warning
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(process.env.MONGODB_URI);

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
