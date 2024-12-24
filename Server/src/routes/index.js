// src/routes/index.js
import { Router } from 'express';
import bookingRoutes from './bookingRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);
router.use('/admin', adminRoutes); // Add this line

export default router;