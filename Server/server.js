// server.js
import express from 'express';
import cors from 'cors';
import routes from './src/routes/index.js';
import connectDB from './src/config/database.js';
import corsOptions from './src/middlewares/cors.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

connectDB();

// Use routes
app.use('/api', routes);

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