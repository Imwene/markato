// src/controllers/bookingController.js
import Booking from "../models/bookingModel.js";
import {
  sendBookingConfirmation,
  sendAdminNotification,
  sendCancellationConfirmation,
  sendStatusUpdateEmail,
} from "../services/emailService.js";
import { sendStatusUpdateSMS } from "../services/smsService.js";
import { generatePDF } from "../services/pdfService.js";

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

    // Validate the new status
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

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Append a new status record to the status history with Pacific Time
    booking.statusHistory.push({
      status,
      timestamp: new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
      ),
      note,
    });

    // Update the current status
    booking.status = status;

    // Save the updated booking
    await booking.save();

    // Send email notification to customer
    if (booking.email) {
      try {
        await sendStatusUpdateEmail(booking, status, note);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    }

    // Send SMS status update
    if (booking.contact) {
      try {
        await sendStatusUpdateSMS(booking, status, note);
      } catch (smsError) {
        console.error("Failed to send SMS status update:", smsError);
      }
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

export const generateBookingPDF = async (req, res) => {
  try {
    const { confirmationNumber } = req.params;
    const booking = await Booking.findOne({ confirmationNumber });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking-${confirmationNumber}.pdf`
    );

    // Generate and pipe the PDF
    const doc = generatePDF(booking);
    doc.pipe(res);
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
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
      "7:00 PM",
      "8:00 PM",
    ];

    const maxBookingsPerSlot = 2;
    const slots = {};

    await Promise.all(
      businessHours.map(async (time) => {
        const dateTimePattern = `^${date}, ${time}$`;

        const bookingsCount = await Booking.countDocuments({
          dateTime: { $regex: new RegExp(dateTimePattern) },
          status: { $nin: ["cancelled"] },
        });

        // Only return availability status, not counts
        slots[time] = {
          available: bookingsCount < maxBookingsPerSlot,
        };
      })
    );

    res.json({
      success: true,
      slots,
    });
  } catch (error) {
    console.error("Date slots availability check error:", error);
    res.status(500).json({
      success: false,
      error: "Error checking availability",
    });
  }
};

export const checkSlotAvailability = async (req, res) => {
  try {
    const { dateTime } = req.query;

    // The dateTime comes in format: "Wed, Jan 8, 2025, 11:00 AM"
    // First, let's split the date and time
    const [datePart, timePart] = dateTime.split(", ").slice(-2);

    // Create a regex pattern to match this exact date and time
    const dateTimePattern = `^${dateTime
      .split(", ")
      .slice(0, -1)
      .join(", ")}, ${timePart}$`;

    // Count bookings for this exact date and time slot
    const bookingsCount = await Booking.countDocuments({
      dateTime: { $regex: new RegExp(dateTimePattern) },
      status: { $nin: ["cancelled"] },
    });

    // For debugging
    // console.log("Checking availability for:", dateTime);
    // console.log("Pattern used:", dateTimePattern);
    // console.log("Bookings found:", bookingsCount);

    const maxBookingsPerSlot = 2; // You can adjust this number
    const isAvailable = bookingsCount < maxBookingsPerSlot;

    res.json({
      success: true,
      available: isAvailable,
      currentBookings: bookingsCount,
      maxBookingsPerSlot,
      requestedDateTime: dateTime,
      pattern: dateTimePattern, // Including this for debugging
    });
  } catch (error) {
    console.error("Slot availability check error:", error);
    res.status(500).json({
      success: false,
      error: "Error checking slot availability",
      details: error.message,
    });
  }
};

export const checkCancellation = async (req, res) => {
  try {
    const { confirmationNumber, email } = req.params;
    const decodedEmail = Buffer.from(email, "base64").toString();

    const booking = await Booking.findOne({
      confirmationNumber,
      email: decodedEmail,
      status: { $nin: ["cancelled", "completed"] },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found or already cancelled/completed",
      });
    }

    const appointmentTime = new Date(booking.dateTime);
    const now = new Date();
    const pacificNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    const hoursUntilAppointment =
      (appointmentTime - pacificNow) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        success: false,
        error:
          "Cancellations must be made at least 24 hours before the appointment",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { confirmationNumber, email } = req.params;
    const decodedEmail = Buffer.from(email, "base64").toString();

    const booking = await Booking.findOne({
      confirmationNumber,
      email: decodedEmail,
      status: { $nin: ["cancelled", "completed"] },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found or already cancelled/completed",
      });
    }

    const appointmentTime = new Date(booking.dateTime);
    const now = new Date();
    const pacificNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    const hoursUntilAppointment =
      (appointmentTime - pacificNow) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        success: false,
        error:
          "Cancellations must be made at least 24 hours before the appointment",
      });
    }

    booking.status = "cancelled";
    booking.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      note: "Cancelled by customer through cancellation page",
    });

    await booking.save();

    // Send cancellation confirmation emails
    try {
      await sendCancellationConfirmation(booking);
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }

    // Send cancellation confirmation SMS
    try {
      await sendStatusUpdateSMS(
        booking,
        booking.status,
        "Cancelled by customer through cancellation page"
      );
    } catch (smsError) {
      console.error("Failed to send SMS status update:", smsError);
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove immutable fields
    const immutableFields = ["confirmationNumber", "_id", "createdAt"];
    immutableFields.forEach((field) => delete updateData[field]);

    const originalBooking = await Booking.findById(id);
    if (!originalBooking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    // Preserve original values if not being updated
    const updatedData = {
      ...originalBooking.toObject(),
      ...updateData,
      totalPrice: updateData.totalPrice || originalBooking.totalPrice,
      optionalServices:
        updateData.optionalServices || originalBooking.optionalServices,
    };

    let statusNote = "";

    // Special handling for date/time changes
    if (
      updateData.dateTime &&
      updateData.dateTime !== originalBooking.dateTime
    ) {
      const slotAvailable = await checkSlotAvailabilityInternal(
        updateData.dateTime,
        id
      );
      if (!slotAvailable) {
        return res
          .status(400)
          .json({ success: false, error: "New time slot is not available" });
      }

      statusNote = `Rescheduled from ${originalBooking.dateTime} to ${updateData.dateTime}`;
      updatedData.statusHistory = [
        ...originalBooking.statusHistory,
        {
          status: "pending",
          timestamp: new Date().toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
          }),
          note: statusNote,
        },
      ];
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).select("-__v");

    // Send email notification about the update
    if (updatedBooking.email) {
      try {
        await sendStatusUpdateEmail(
          updatedBooking,
          updatedBooking.status,
          statusNote || "Booking details have been updated"
        );
      } catch (emailError) {
        console.error("Failed to send update notification email:", emailError);
        // Don't fail the update if email fails
      }
    }

    // Send SMS status update
    if (updatedBooking.contact) {
      try {
        await sendStatusUpdateSMS(
          updatedBooking,
          updatedBooking.status,
          statusNote || "Booking details have been updated"
        );
      } catch (smsError) {
        console.error("Failed to send update notification SMS:", smsError);
        // Don't fail the update if SMS fails
      }
    }

    res.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Helper function using existing availability logic
async function checkSlotAvailabilityInternal(dateTime, bookingId) {
  // Add bookingId parameter
  try {
    const [datePart, timePart] = dateTime.split(", ").slice(-2);
    const dateTimePattern = `^${dateTime
      .split(", ")
      .slice(0, -1)
      .join(", ")}, ${timePart}$`;

    const query = {
      dateTime: { $regex: new RegExp(dateTimePattern) },
      status: { $nin: ["cancelled"] },
    };

    // Only exclude current booking if ID is provided
    if (bookingId) {
      query._id = { $ne: bookingId };
    }

    const bookingsCount = await Booking.countDocuments(query);
    const maxBookingsPerSlot = 2;
    return bookingsCount < maxBookingsPerSlot;
  } catch (error) {
    return false;
  }
}

export const handleSMSWebhook = async (req, res) => {
  try {
    const { Body, From, MessageSid } = req.body;

    // Log incoming message
    // console.log({
    //   event: 'sms_received',
    //   from: From,
    //   body: Body,
    //   messageId: MessageSid,
    //   timestamp: new Date().toISOString()
    // });

    // Send a basic response
    const twiml = new twilio.twiml.MessagingResponse();

    if (Body.toUpperCase() === "HELP") {
      twiml.message("For assistance, please call 4158899108.");
    } else {
      twiml.message(
        "Thank you for your message. We will get back to you shortly."
      );
    }

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  } catch (error) {
    console.error("SMS webhook error:", error);
    res.status(500).send("Error processing webhook");
  }
};
