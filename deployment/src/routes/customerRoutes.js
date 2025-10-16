// src/routes/customerRoutes.js
import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createOrUpdateCustomer,
  linkBookingToCustomer,
  autoLinkBookings,
  dropAllCustomers,
  extractCustomersFromBookings,
  getCustomerStats
} from '../controllers/customerController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

// All customer routes require admin authentication
router.use(protect);
router.use(adminOnly);

// Customer CRUD routes
router.get('/', getAllCustomers);
router.get('/stats', getCustomerStats);
router.get('/:id', getCustomerById);
router.post('/', createOrUpdateCustomer);

// Data management routes
router.delete('/drop-all', dropAllCustomers);
router.post('/extract-from-bookings', extractCustomersFromBookings);

// Booking linking routes
router.post('/link-booking', linkBookingToCustomer);
router.post('/:id/auto-link', autoLinkBookings);

export default router;