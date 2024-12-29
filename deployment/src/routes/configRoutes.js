// src/routes/configRoutes.js
import { Router } from 'express';
import {
  getVehicleTypes,
  updateVehicleType,
  createVehicleType,
  getScents,
  updateScent,
  createScent,
  getOptionalServices,
  updateOptionalService,
  createOptionalService
} from '../controllers/configController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

// Vehicle Types Routes
router.get('/vehicle-types', getVehicleTypes);  // Keep public for frontend access
router.post('/vehicle-types', protect, adminOnly, createVehicleType);
router.put('/vehicle-types/:id', protect, adminOnly, updateVehicleType);

// Scents Routes
router.get('/scents', getScents);  // Keep public for frontend access
router.post('/scents', protect, adminOnly, createScent);
router.put('/scents/:id', protect, adminOnly, updateScent);

// Optional Services Routes
router.get('/optional-services', getOptionalServices);  // Keep public for frontend access
router.post('/optional-services', protect, adminOnly, createOptionalService);
router.put('/optional-services/:id', protect, adminOnly, updateOptionalService);

export default router;