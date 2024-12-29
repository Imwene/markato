import { Router } from 'express';
import { createBooking, getAllBookings, getBookingById, updateBookingStatus, generateBookingPDF, resendBookingEmail } from '../controllers/bookingController.js';

const router = Router();

router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.get('/:confirmationNumber/pdf', generateBookingPDF);
router.post('/:confirmationNumber/resend-email', resendBookingEmail);


export default router;