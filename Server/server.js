// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from 'compression';
import routes from "./src/routes/index.js";
import connectDB from "./src/config/database.js";
import corsOptions from "./src/middlewares/cors.js";
import { securityMiddleware } from "./src/middlewares/security.js";

const app = express();

// Connect to database
connectDB();

// Apply compression
app.use(compression());

// Basic middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors(corsOptions));

// Apply security middleware
app.use(securityMiddleware);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API routes
app.use("/api", routes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  
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

// Server setup
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, "0.0.0.0", () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  }
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Starting graceful shutdown...');
  
  server.close(async () => {
    try {
      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Error handling
process.on("unhandledRejection", (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown();
});

process.on("uncaughtException", (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);