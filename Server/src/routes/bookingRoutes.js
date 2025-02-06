import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  generateBookingPDF,
  resendBookingEmail,
  checkSlotAvailability,
  checkCancellation,
  cancelBooking,
  checkDateAvailability,
  updateBooking,
  handleSMSWebhook,
} from "../controllers/bookingController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import twilio from "twilio";

const router = Router();

const twilioAuthMiddleware = twilio.webhook({ validate: true });

router.get("/check-cancellation/:confirmationNumber/:email", checkCancellation);
router.post("/cancel/:confirmationNumber/:email", cancelBooking);

router.post("/", createBooking); // Allow anyone to create a booking
router.get("/check-date-slots", checkDateAvailability);
router.get("/check-slot", checkSlotAvailability); // Allow checking slot availability

router.get("/", protect, adminOnly, getAllBookings); // List all bookings

router.get("/:confirmationNumber/pdf", generateBookingPDF); // Allow PDF download
router.post("/:confirmationNumber/resend-email", resendBookingEmail); // Allow email resend

router.get("/:id", protect, adminOnly, getBookingById); // Get booking details
router.put("/:id/status", protect, adminOnly, updateBookingStatus);
router.put("/:id", protect, adminOnly, updateBooking);

router.post("/sms/webhook", twilioAuthMiddleware, handleSMSWebhook);

export default router;
