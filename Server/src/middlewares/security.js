// src/middlewares/security.js
import rateLimit from 'express-rate-limit';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';

dotenv.config();

// Rate limiting - make it less restrictive for development
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
  message: 'Too many requests from this IP, please try again later.'
});

// Security Headers - modified for API use
export const securityHeaders = (req, res, next) => {
  // Remove HSTS header for development
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.removeHeader('X-Powered-By');
  
  // Modified CSP for API
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'"
  );
  
  next();
};

// Session Configuration
export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-development',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/markato',
    ttl: 24 * 60 * 60 // Session TTL (1 day)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
};