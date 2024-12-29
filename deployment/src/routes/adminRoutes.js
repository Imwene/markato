// src/routes/adminRoutes.js
import { Router } from 'express';
import { getDashboardStats, deleteAllBookings } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/dashboard', protect, adminOnly, getDashboardStats); 
router.delete('/bookings/delete-all', protect, adminOnly, deleteAllBookings); 

export default router;