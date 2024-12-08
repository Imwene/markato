import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bookingRoutes from './../routes/bookingRoutes.js';  // Updated path
import corsOptions from './../middlewares/cors.js';  // Updated path    
import connectDB from './../config/database.js';  // Updated path    

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// CORS configuration
app.use(cors(corsOptions));


app.use(express.json());

connectDB();

// Routes
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});