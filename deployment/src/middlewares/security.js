// src/middlewares/security.js
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip);
  }
});

// Enhanced security headers
export const securityHeaders = (req, res, next) => {
  // HSTS in production only
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.removeHeader('X-Powered-By');

  // Enhanced CSP for API
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );

  // Cross-Origin policies
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: false, // We're handling CSP manually above
  crossOriginEmbedderPolicy: false, // We're handling COEP manually
  crossOriginOpenerPolicy: false, // We're handling COOP manually
  crossOriginResourcePolicy: false, // We're handling CORP manually
});

// Common security middleware composition
export const securityMiddleware = [
  helmetConfig,
  securityHeaders,
  process.env.NODE_ENV === 'production' ? rateLimiter : null
].filter(Boolean);