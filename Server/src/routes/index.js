import { Router } from 'express';
const router = Router();
import bookingRoutes from './bookingRoutes';
import serviceRoutes from './serviceRoutes';

router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);

export default router;