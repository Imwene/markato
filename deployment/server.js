// // server.js
// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import session from "express-session";
// import routes from "./src/routes/index.js";
// import connectDB from "./src/config/database.js";
// import corsOptions from "./src/middlewares/cors.js";
// import {
//   rateLimiter,
//   securityHeaders,
//   sessionConfig,
// } from "./src/middlewares/security.js";
// import path from 'path';
// import { fileURLToPath } from 'url';



// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();



// // Connect to database
// connectDB();

// // Base middleware
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// // Security middleware with more lenient settings for development
// if (process.env.NODE_ENV === "production") {
//   app.use(rateLimiter);
//   app.use(securityHeaders);
// }

// // Session setup (only if you need session management)
// app.use(session(sessionConfig));


// app.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
//   );
//   next();
// });

// // Routes
// app.use("/api", routes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);

//   // Send appropriate error response
//   res.status(err.status || 500).json({
//     success: false,
//     error:
//       process.env.NODE_ENV === "production"
//         ? "Server Error"
//         : err.message || "Server Error",
//     ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
//   });
// });

// // Set up EJS as the view engine
// app.set('view engine', 'ejs');
// // Set the directory for the views
// app.set('views', path.join(__dirname, 'src', 'views'));

// // Start server
// const PORT = process.env.PORT || 8080;
// const server = app.listen(PORT, "0.0.0.0", () => {
//   //console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
// });

// // Handle unhandled promise rejections
// process.on("unhandledRejection", (err) => {
//   console.error("Unhandled Promise Rejection:", err);
//   server.close(() => process.exit(1));
// });

// // Handle uncaught exceptions
// process.on("uncaughtException", (err) => {
//   console.error("Uncaught Exception:", err);
//   server.close(() => process.exit(1));
// });

// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import routes from "./src/routes/index.js";
import connectDB from "./src/config/database.js";
import corsOptions from "./src/middlewares/cors.js";
import { showCancellationPage, confirmCancellation } from "./src/controllers/bookingController.js";
import {
  rateLimiter,
  securityHeaders,
  sessionConfig,
} from "./src/middlewares/security.js";
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();



// Connect to database
connectDB();


// Set up EJS as the view engine
app.set('view engine', 'ejs');
// Set the directory for the views
app.set('views', path.join(__dirname, 'src', 'views'));


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

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self';"
  );
  next();
});

app.get('/api/bookings/cancel/:confirmationNumber/:email', showCancellationPage);
app.post('/api/bookings/cancel/:confirmationNumber/:email', confirmCancellation);
app.get('/api/bookings/cancel/success', (req, res) => {
    res.render('cancellation-success');
});
app.get('/api/bookings/cancel/error', (req, res) => {
    res.render('error', { message: req.query.message || 'An error occurred' });
});


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
