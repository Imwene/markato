// src/controllers/bookingController.js
import PDFDocument from "pdfkit";
import Booking from "../models/bookingModel.js";
import { sendBookingConfirmation, sendAdminNotification, sendCancellationConfirmation } from "../services/emailService.js";


export async function createBooking(req, res) {
  try {
    //console.log('Received booking:', req.body);

    const basePrice = parseFloat(req.body.servicePrice);
    const optionalServicesTotal = (req.body.optionalServices || []).reduce(
      (total, service) => total + parseFloat(service.price),
      0
    );
    const totalPrice = basePrice + optionalServicesTotal;

    const bookingData = {
      ...req.body,
      totalPrice,
      optionalServices: req.body.optionalServices || [],
    };

    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();

    //send admin notification
    try {
      await sendAdminNotification(savedBooking);
    } catch (emailError) {
      // Log the error but don't fail the booking creation
      console.error("Failed to send admin notification:", emailError);
    }

    res.status(201).json({
      success: true,
      data: savedBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id).select("-__v");

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note = "" } = req.body;

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Add to status history
    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
    });

    // Update current status
    booking.status = status;

    // Save the updated booking
    await booking.save();

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export const generateBookingPDF = async (req, res) => {
  try {
    const { confirmationNumber } = req.params;
    //console.log('Generating PDF for booking:', confirmationNumber); // Debug log

    const booking = await Booking.findOne({ confirmationNumber });

    if (!booking) {
      //console.log('Booking not found:', confirmationNumber); // Debug log
      return res.status(404).json({ error: "Booking not found" });
    }

    // Create a new PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking-${confirmationNumber}.pdf`
    );

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add content to the PDF
    doc
      .fontSize(20)
      .fillColor("#0cc0df")
      .text("Markato Auto Detailing", { align: "center" });

    doc.moveDown();
    doc
      .fontSize(16)
      .fillColor("#000")
      .text("Booking Confirmation", { align: "center" });

    // Add booking details
    doc.moveDown();
    doc.fontSize(12).text(`Confirmation Number: ${booking.confirmationNumber}`);

    doc.moveDown();
    doc.text(`Date & Time: ${booking.dateTime}`);
    doc.text(`Customer Name: ${booking.name}`);
    doc.text(`Contact: ${booking.contact}`);
    if (booking.email) doc.text(`Email: ${booking.email}`);

    doc.moveDown();
    doc.text("Vehicle Details:");
    doc.text(`Make/Model: ${booking.makeModel}`);
    doc.text(`Vehicle Type: ${booking.vehicleType}`);

    doc.moveDown();
    doc.text("Service Details:");
    doc.text(`Service: ${booking.serviceName}`);
    doc.text(`Service Price: $${booking.servicePrice}`);
    doc.text(`Selected Scent: ${booking.selectedScent}`);

    // Add optional services if any
    if (booking.optionalServices && booking.optionalServices.length > 0) {
      doc.moveDown();
      doc.text("Optional Services:");
      booking.optionalServices.forEach((service) => {
        doc.text(`- ${service.name}: $${service.price}`);
      });
    }

    // Add total
    doc.moveDown();
    doc.text(`Total Amount: $${booking.totalPrice}`, { bold: true });

    // Add footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("#666")
      .text("Thank you for choosing Markato Auto Detailing!", {
        align: "center",
      });
    doc.text("Please present this confirmation at the time of service.", {
      align: "center",
    });

    // Finalize PDF file
    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};
export const resendBookingEmail = async (req, res) => {
  const { confirmationNumber } = req.params;
  const booking = await Booking.findOne({ confirmationNumber });

  if (!booking || !booking.email) {
    return res
      .status(404)
      .json({ error: "Booking not found or no email provided" });
  }

  const emailSent = await sendBookingConfirmation(booking);

  if (emailSent) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to send email" });
  }
};

export const checkDateAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    
    const businessHours = [
      "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
      "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM","6:00 PM","7:00 PM","8:00 PM"
    ];

    const maxBookingsPerSlot = 2;
    const slots = {};

    await Promise.all(
      businessHours.map(async (time) => {
        const dateTimePattern = `^${date}, ${time}$`;
        
        const bookingsCount = await Booking.countDocuments({
          dateTime: { $regex: new RegExp(dateTimePattern) },
          status: { $nin: ['cancelled'] }
        });

        // Only return availability status, not counts
        slots[time] = {
          available: bookingsCount < maxBookingsPerSlot
        };
      })
    );

    res.json({
      success: true,
      slots
    });

  } catch (error) {
    console.error('Date slots availability check error:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking availability'
    });
  }
};

export const checkSlotAvailability = async (req, res) => {
  try {
    const { dateTime } = req.query;
    
    // The dateTime comes in format: "Wed, Jan 8, 2025, 11:00 AM"
    // First, let's split the date and time
    const [datePart, timePart] = dateTime.split(', ').slice(-2);
    
    // Create a regex pattern to match this exact date and time
    const dateTimePattern = `^${dateTime.split(', ').slice(0, -1).join(', ')}, ${timePart}$`;
    
    // Count bookings for this exact date and time slot
    const bookingsCount = await Booking.countDocuments({
      dateTime: { $regex: new RegExp(dateTimePattern) },
      status: { $nin: ['cancelled'] }
    });

    // For debugging
    console.log('Checking availability for:', dateTime);
    console.log('Pattern used:', dateTimePattern);
    console.log('Bookings found:', bookingsCount);

    const maxBookingsPerSlot = 2; // You can adjust this number
    const isAvailable = bookingsCount < maxBookingsPerSlot;

    res.json({
      success: true,
      available: isAvailable,
      currentBookings: bookingsCount,
      maxBookingsPerSlot,
      requestedDateTime: dateTime,
      pattern: dateTimePattern // Including this for debugging
    });
  } catch (error) {
    console.error('Slot availability check error:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking slot availability',
      details: error.message
    });
  }
};

export const checkCancellation = async (req, res) => {
  try {
    const { confirmationNumber, email } = req.params;
    const decodedEmail = Buffer.from(email, 'base64').toString();

    const booking = await Booking.findOne({ 
      confirmationNumber,
      email: decodedEmail,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or already cancelled/completed'
      });
    }

    const appointmentTime = new Date(booking.dateTime);
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        success: false,
        error: 'Cancellations must be made at least 24 hours before the appointment'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { confirmationNumber, email } = req.params;
    const decodedEmail = Buffer.from(email, 'base64').toString();

    const booking = await Booking.findOne({ 
      confirmationNumber,
      email: decodedEmail,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or already cancelled/completed'
      });
    }

    const appointmentTime = new Date(booking.dateTime);
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        success: false,
        error: 'Cancellations must be made at least 24 hours before the appointment'
      });
    }

    booking.status = 'cancelled';
    booking.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Cancelled by customer through cancellation page'
    });

    await booking.save();

    // Send cancellation confirmation emails
    try {
      await sendCancellationConfirmation(booking);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};