// src/services/smsService.js
import twilio from "twilio";
import dotenv from "dotenv";
import numberFormatterService from "./numberFormatterService.js"; // Use YOUR actual path

dotenv.config();

// 1. Add environment variable validation
const requiredEnvVars = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_MESSAGING_SERVICE_SID",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 2. Add specific status messages
const STATUS_MESSAGES = {
  pending: "is pending confirmation",
  confirmed: "has been confirmed by Markato Auto Detail",
  cancelled: "has been cancelled",
  in_progress: "service is in progress",
  completed:
    "service has been completed. Thank you for choosing Markato Auto Detail!",
};

// 3. Add rate limiting
const rateLimiter = new Map();
const RATE_LIMIT = 2; // messages per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(phoneNumber) {
  const now = Date.now();
  const userHistory = rateLimiter.get(phoneNumber) || [];

  // Remove old entries
  const recentHistory = userHistory.filter((time) => now - time < RATE_WINDOW);

  if (recentHistory.length >= RATE_LIMIT) {
    return false;
  }

  recentHistory.push(now);
  rateLimiter.set(phoneNumber, recentHistory);
  return true;
}

// 4. Add retry logic with exponential backoff
async function sendWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000; // exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function sendBookingConfirmationSMS(booking) {
  // Validate inputs
  if (!booking?.confirmationNumber) {
    throw new Error("Missing booking confirmation number");
  }

  if (!booking?.contact) {
    throw new Error("Missing contact information");
  }

  if (!booking?.serviceName) {
    throw new Error("Missing service name");
  }

  if (!booking?.dateTime) {
    throw new Error("Missing appointment date/time");
  }

  try {
    const countryCode = booking.countryCode || "US";
    const e164Contact = numberFormatterService(booking.contact, countryCode);

    if (!e164Contact) {
      throw new Error(`Invalid phone number format: ${booking.contact}`);
    }

    if (!checkRateLimit(e164Contact)) {
      throw new Error(`Rate limit exceeded for ${e164Contact}`);
    }

    // Build the confirmation message
    let messageBody = `Markato Auto Detail - Booking Confirmed

Booking #${booking.confirmationNumber}
Service: ${booking.serviceName}
Date & Time: ${booking.dateTime}`;

    // Add optional services if any
    if (booking.optionalServices && booking.optionalServices.length > 0) {
      messageBody += `\nAdd-ons:`;
      booking.optionalServices.forEach((service) => {
        if (service.name === "Seat Cloth Shampoo" && service.seatCount) {
          messageBody += `\n• ${service.name} (${service.seatCount} seats): $${service.price}`;
        } else {
          messageBody += `\n• ${service.name}: $${service.price}`;
        }
      });
    }

    messageBody += `\nTotal: $${booking.totalPrice}

Location: 1901 Park Blvd, Oakland, CA 94606
Questions? Call (415) 889-9108

Please arrive 5-10 minutes early. Thank you for choosing Markato Auto Detail!`;

    const message = await sendWithRetry(async () => {
      return client.messages.create({
        body: messageBody,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
        to: e164Contact,
      });
    });

    console.log({
      event: "booking_confirmation_sms_sent",
      messageId: message.sid,
      booking: booking.confirmationNumber,
      customer: booking.name,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: message.sid,
      sentTo: e164Contact,
      bookingNumber: booking.confirmationNumber,
    };
  } catch (error) {
    console.error({
      event: "booking_confirmation_sms_error",
      error: error.message,
      booking: booking.confirmationNumber,
      customer: booking.name,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

export async function sendStatusUpdateSMS(booking, newStatus, note = "") {
  // Validate inputs
  if (!booking?.confirmationNumber) {
    throw new Error("Missing booking confirmation number");
  }

  if (!booking?.contact) {
    throw new Error("Missing contact information");
  }

  if (!STATUS_MESSAGES[newStatus]) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  try {
    const countryCode = booking.countryCode || "US";
    const e164Contact = numberFormatterService(booking.contact, countryCode);

    if (!e164Contact) {
      throw new Error(`Invalid phone number format: ${booking.contact}`);
    }

    if (!checkRateLimit(e164Contact)) {
      throw new Error(`Rate limit exceeded for ${e164Contact}`);
    }

    // Build the message body and include the note if provided
    let messageBody = `Markato Auto Detail: Booking #${booking.confirmationNumber} ${STATUS_MESSAGES[newStatus]}`;
    if (note && note.trim().length > 0) {
      messageBody += `\nNote: ${note}`;
    }
    messageBody += `\n\nQuestions? Call (415) 889-9108`;

    const message = await sendWithRetry(async () => {
      return client.messages.create({
        body: messageBody,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
        to: e164Contact,
      });
    });

    console.log({
      event: "sms_sent",
      messageId: message.sid,
      booking: booking.confirmationNumber,
      status: newStatus,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: message.sid,
      sentTo: e164Contact,
      status: newStatus,
    };
  } catch (error) {
    console.error({
      event: "sms_error",
      error: error.message,
      booking: booking.confirmationNumber,
      status: newStatus,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

// 11. Add a method to check message status
export async function checkMessageStatus(messageSid) {
  try {
    const message = await client.messages(messageSid).fetch();
    return {
      status: message.status,
      error: message.errorMessage,
      timestamp: message.dateUpdated,
    };
  } catch (error) {
    console.error({
      event: "status_check_error",
      messageSid,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
