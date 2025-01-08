// import { Router } from "express";
// import {
//   createBooking,
//   getAllBookings,
//   getBookingById,
//   updateBookingStatus,
//   generateBookingPDF,
//   resendBookingEmail,
//   checkSlotAvailability,
//   showCancellationPage,
//   confirmCancellation
// } from "../controllers/bookingController.js";

// import { protect, adminOnly } from "../middlewares/authMiddleware.js";

// const router = Router();

// router.post("/", createBooking); // Allow anyone to create a booking
// router.get("/check-slot", checkSlotAvailability); // Allow checking slot availability

// router.get('/cancel/:confirmationNumber/:email', showCancellationPage); // Allow viewing cancel page
// router.post('/cancel/:confirmationNumber/:email', confirmCancellation);
// router.get('/cancel/success', (req, res) => {
//     res.render('cancellation-success');
// });
// router.get("/", protect, adminOnly, getAllBookings); // List all bookings

// router.get("/:confirmationNumber/pdf", generateBookingPDF); // Allow PDF download
// router.post("/:confirmationNumber/resend-email", resendBookingEmail); // Allow email resend

// router.get("/:id", protect, adminOnly, getBookingById); // Get booking details
// router.put("/:id/status", protect, adminOnly, updateBookingStatus); 



// export default router;


import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  generateBookingPDF,
  resendBookingEmail,
  checkSlotAvailability,
  showCancellationPage,
  confirmCancellation
} from "../controllers/bookingController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();

//router.get('/cancel/:confirmationNumber/:email', showCancellationPage); // Allow viewing cancel page
//router.post('/cancel/:confirmationNumber/:email', confirmCancellation);
//router.get('/cancel/success', (req, res) => {
//    res.render('cancellation-success');
//});

router.post("/", createBooking); // Allow anyone to create a booking
router.get("/check-slot", checkSlotAvailability); // Allow checking slot availability

router.get("/", protect, adminOnly, getAllBookings); // List all bookings

router.get("/:confirmationNumber/pdf", generateBookingPDF); // Allow PDF download
router.post("/:confirmationNumber/resend-email", resendBookingEmail); // Allow email resend

router.get("/:id", protect, adminOnly, getBookingById); // Get booking details
router.put("/:id/status", protect, adminOnly, updateBookingStatus); 



export default router;