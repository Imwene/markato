// src/routes/adminRoutes.js
import { Router } from 'express';
import { getDashboardStats, deleteAllBookings } from '../controllers/adminController.js';

const router = Router();

router.get('/dashboard', getDashboardStats);
router.delete('/bookings/delete-all', deleteAllBookings);

export default router;