// src/routes/index.js
import { Router } from 'express';
import bookingRoutes from './bookingRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import adminRoutes from './adminRoutes.js';
import configRoutes from './configRoutes.js';
import authRoutes from './authRoutes.js';
const router = Router();

// API Routes
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);
router.use('/admin', adminRoutes);
router.use('/config', configRoutes);
router.use('/auth', authRoutes);
export default router;