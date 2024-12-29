// src/routes/serviceRoutes.js
import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  checkServiceName,
  checkServiceBookings
} from '../controllers/serviceController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes (needed for frontend booking system)
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected admin-only routes
router.post('/', protect, adminOnly, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);
router.get('/check-name', protect, adminOnly, checkServiceName);
router.get('/:id/bookings/check', protect, adminOnly, checkServiceBookings);

export default router;