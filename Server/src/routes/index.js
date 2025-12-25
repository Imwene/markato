// src/routes/index.js
import { Router } from 'express';
import mongoose from 'mongoose';
import bookingRoutes from './bookingRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import adminRoutes from './adminRoutes.js';
import configRoutes from './configRoutes.js';
import authRoutes from './authRoutes.js';
import customerRoutes from './customerRoutes.js';

const router = Router();

// Health check endpoint for Docker/Kubernetes
router.get('/health', async (req, res) => {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    healthcheck.database = {
      status: dbState === 1 ? 'ok' : 'error',
      state: dbStates[dbState] || 'unknown',
    };

    // If database is not connected, return 503
    if (dbState !== 1) {
      healthcheck.status = 'error';
      return res.status(503).json(healthcheck);
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'error';
    healthcheck.error = error.message;
    res.status(503).json(healthcheck);
  }
});

// Liveness probe - simple check that server is running
router.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness probe - check if server is ready to accept traffic
router.get('/health/ready', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  
  if (dbState === 1) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready', database: 'disconnected' });
  }
});

// API Routes
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);
router.use('/admin', adminRoutes);
router.use('/config', configRoutes);
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);

export default router;