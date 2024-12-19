import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import serviceRoutes from './src/routes/serviceRoutes.js';  
import bookingRoutes from './src/routes/bookingRoutes.js';  // Updated path
import corsOptions from './src/middlewares/cors.js';  // Updated path    
import connectDB from './src/config/database.js';  // Updated path  

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// CORS configuration
app.use(cors(corsOptions));


app.use(express.json());

connectDB();

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);


const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});