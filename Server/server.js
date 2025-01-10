// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from 'compression';
import routes from "./src/routes/index.js";
import connectDB from "./src/config/database.js";
import corsOptions from "./src/middlewares/cors.js";
import { securityMiddleware } from "./src/middlewares/security.js";
import mongoose from 'mongoose';

const app = express();

// Trust proxy - IMPORTANT for correct IP handling behind Nginx
app.set('trust proxy', true);

// Connect to database
connectDB();

// Apply compression
app.use(compression());

// Basic middleware with increased limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors(corsOptions));

// Apply security middleware
app.use(securityMiddleware);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - IP: ${req.ip}`);
    console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);
    next();
  });
}

// API routes
app.use("/api", routes);

// Error handling with rate limit specific handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Special handling for rate limit errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Server Error' 
      : err.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Server setup with error handling
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, "0.0.0.0", () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  }
});

// Graceful shutdown with timeout handling
const gracefulShutdown = async (signal) => {
  console.log(`Starting graceful shutdown... (Signal: ${signal})`);
  
  let shutdownTimeout = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
  
  try {
    server.close();
    await mongoose.connection.close();
    clearTimeout(shutdownTimeout);
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// Error handling with process monitoring
process.on("unhandledRejection", (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

process.on("uncaughtException", (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));