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

const router = Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);
router.get('/check-name', checkServiceName); // For checking duplicate service names
router.get('/:id/bookings/check', checkServiceBookings); // For checking if service has bookings
export default router;