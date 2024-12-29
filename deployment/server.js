// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import routes from "./src/routes/index.js";
import connectDB from "./src/config/database.js";
import corsOptions from "./src/middlewares/cors.js";
import {
  rateLimiter,
  securityHeaders,
  sessionConfig,
} from "./src/middlewares/security.js";

const app = express();

// Connect to database
connectDB();

// Base middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware with more lenient settings for development
if (process.env.NODE_ENV === "production") {
  app.use(rateLimiter);
  app.use(securityHeaders);
}

// Session setup (only if you need session management)
app.use(session(sessionConfig));

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Send appropriate error response
  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Server Error"
        : err.message || "Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, "0.0.0.0", () => {
  //console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => process.exit(1));
});
