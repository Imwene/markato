// src/services/emailService.js
import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-load the image at startup
const logoPath = path.join(__dirname, "email-logo.jpg");
const JPG_MARKATO = fs.readFileSync(logoPath).toString("base64");
//console.log("Logo loaded:", JPG_MARKATO.length);

const resend = new Resend(process.env.RESEND_API_KEY);

const formatPrice = (price) => {
  return ` $${price}`;
};

const createAdminEmailTemplate = (booking) => {
  const optionalServicesSection =
    booking.optionalServices?.length > 0
      ? `
      <div style="padding-top: 20px; margin-top: 20px; border-top: 1px solid #e2e8f0;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">
          Optional Services Selected
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f8fafc;">
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Service</th>
            <th style="text-align: right; padding: 8px; border: 1px solid #e2e8f0;">Price</th>
          </tr>
          ${booking.optionalServices
            .map(
              (service) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${service.name}</td>
              <td style="text-align: right; padding: 8px; border: 1px solid #e2e8f0;">$${service.price}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      </div>
    `
      : '<p style="color: #64748b;">No optional services selected</p>';

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a202c; margin: 0 0 16px 0;">
          New Booking Received
        </h1>
        <div style="color: #4a5568; font-size: 16px;">
          Booking #: <span style="color: #0cc0df; font-family: monospace; font-weight: 600;">
            ${booking.confirmationNumber}
          </span>
        </div>
      </div>

      <!-- Customer Information -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Customer Details
        </h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Name:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${
              booking.name
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Contact:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${
              booking.contact
            }</td>
          </tr>
          ${
            booking.email
              ? `
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Email:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.email}</td>
          </tr>
          `
              : ""
          }
        </table>
      </div>

      <!-- Vehicle & Service Details -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Vehicle & Service Details
        </h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Vehicle:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.makeModel} (${booking.vehicleType})
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Service:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.serviceName}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Base Price:</td>
            <td style="padding: 8px 0; color: #0cc0df; font-weight: 500;">
              $${booking.servicePrice}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Selected Scent:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.selectedScent}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Appointment:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.dateTime}
            </td>
          </tr>
        </table>
      </div>

      ${optionalServicesSection}

      <!-- Total Amount -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 600; color: #1a202c;">Total Amount:</span>
          <span style="color: #0cc0df; font-size: 24px; font-weight: 600;">$${
            booking.totalPrice
          }</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="margin-top: 32px; text-align: center;">
        <p style="margin-bottom: 16px; color: #4a5568;">
          You can manage this booking in the admin dashboard:
        </p>
        <a href="${process.env.FRONTEND_URL}/admin/bookings" 
           style="display: inline-block; padding: 12px 24px; background-color: #0cc0df; 
                  color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View in Dashboard
        </a>
      </div>
    </div>
  `;
};

const createEmailTemplate = (booking) => {
  const encodedEmail = Buffer.from(booking.email).toString("base64");
  const cancelUrl = `${process.env.FRONTEND_URL}/cancel-booking/${booking.confirmationNumber}/${encodedEmail}`;

  const optionalServicesSection =
    booking.optionalServices?.length > 0
      ? `
      <div style="padding-top: 20px; margin-top: 20px; border-top: 1px solid #e2e8f0;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">
          Optional Services Selected
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f8fafc;">
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Service</th>
            <th style="text-align: right; padding: 8px; border: 1px solid #e2e8f0;">Price</th>
          </tr>
          ${booking.optionalServices
            .map(
              (service) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${service.name}</td>
              <td style="text-align: right; padding: 8px; border: 1px solid #e2e8f0;">$${service.price}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      </div>
    `
      : '<p style="color: #64748b;">No optional services selected</p>';

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
    <!-- Company Logo -->
    <div style="text-align: center; margin-bottom: 24px;">
        <img src="data:image/png;base64,${JPG_MARKATO}"  
             alt="Markato Auto Detail" 
             style="height: 60px; width: auto;"
        />
      </div>

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a202c; margin: 0 0 8px 0;">
          Markato Auto Detail
        </h1>
        <div style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
          Thank you for choosing us!
        </div>
        <div style="width: 64px; height: 64px; margin: 0 auto; background-color: #0cc0df; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 32px;">✓</span>
        </div>
        <h2 style="font-size: 28px; font-weight: 700; color: #1a202c; margin: 16px 0;">
          Booking Confirmed
        </h2>
        <div style="color: #4a5568; font-size: 16px;">
          Booking #: <span style="color: #0cc0df; font-family: monospace; font-weight: 600;">
            ${booking.confirmationNumber}
          </span>
        </div>
      </div>

      <!-- Customer Information -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Customer Details
        </h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Name:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${
              booking.name
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Contact:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${
              booking.contact
            }</td>
          </tr>
          ${
            booking.email
              ? `
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Email:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.email}</td>
          </tr>
          `
              : ""
          }
        </table>
      </div>

      <!-- Vehicle & Service Details -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Vehicle & Service Details
        </h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Vehicle:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.makeModel} (${booking.vehicleType})
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Service:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.serviceName}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Base Price:</td>
            <td style="padding: 8px 0; color: #0cc0df; font-weight: 500;">
              $${booking.servicePrice}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Selected Scent:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.selectedScent}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Appointment:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.dateTime}
            </td>
          </tr>
        </table>
      </div>

      ${optionalServicesSection}

      <!-- Total Amount -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 600; color: #1a202c;">Total Amount:</span>
          <span style="color: #0cc0df; font-size: 24px; font-weight: 600;">$${
            booking.totalPrice
          }</span>
        </div>
      </div>

      <!-- Important Notes -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-top: 24px;">
        <h3 style="font-size: 16px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Important Information
        </h3>
        <div style="color: #4a5568;">
          <p style="margin: 0 0 12px 0;">• Please arrive 5-10 minutes before your appointment time.</p>
          <p style="margin: 0 0 12px 0;">• Location: 1901 Park Blvd, Oakland, CA 94606</p>
          <p style="margin: 0 0 12px 0;">• For any questions or changes to your booking, please contact us:</p>
          <p style="margin: 0;">
            <a href="tel:+14158899108" style="color: #0cc0df; text-decoration: none;">
              (415) 889-9108
            </a>
            or
            <a href="mailto:markatoautodetail@gmail.com" style="color: #0cc0df; text-decoration: none;">
              markatoautodetail@gmail.com
            </a>
          </p>
        </div>
      </div>

      <!-- Cancellation Info -->
      <div style="text-align: center; margin-top: 32px;">
  <p style="margin-bottom: 16px; color: #4a5568;">
    Need to cancel your appointment?
  </p>
  <a href="${cancelUrl}"
     style="background: #dc2626;
            border: 1px solid #dc2626;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            font-size: 15px;
            font-weight: 500;
            line-height: 15px;
            text-decoration: none;
            padding: 13px 17px;
            color: #ffffff;
            display: inline-block;
            border-radius: 4px;">
    Cancel Booking
  </a>
  <p style="margin-top: 16px; color: #4a5568; font-size: 14px;">
    Cancellations must be made at least 24 hours before your appointment time.
  </p>
</div>

      <!-- Footer -->
<div style="text-align: center; margin-top: 32px; color: #4a5568; font-size: 14px;">
  <p>Thank you for choosing Markato Auto Detail!</p>
  <p>We look forward to serving you.</p>
  <p style="margin-top: 16px;">
    By booking with us, you agree to our 
    <a 
      href="${process.env.FRONTEND_URL}/communication-terms"
      target="_blank"
      rel="noopener noreferrer"
      style="color: #0cc0df; text-decoration: none; border-bottom: 1px solid #0cc0df;"
    >
      Communication Terms
    </a>
  </p>
</div>
    </div>
  `;
};

const createCancellationEmailTemplate = (booking) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a202c; margin: 0 0 16px 0;">
          Booking Cancellation Confirmed
        </h1>
        <p style="color: #4a5568; font-size: 16px;">
          Your booking has been successfully cancelled
        </p>
        <div style="color: #4a5568; font-size: 16px;">
          Booking #: <span style="color: #0cc0df; font-family: monospace; font-weight: 600;">
            ${booking.confirmationNumber}
          </span>
        </div>
      </div>

      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Cancelled Booking Details
        </h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Service:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.serviceName}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Date & Time:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.dateTime}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Vehicle:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.makeModel}
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 32px;">
        <p style="margin-bottom: 16px; color: #4a5568;">
          Would you like to book another appointment?
        </p>
        <a href="${process.env.FRONTEND_URL}"
           style="background: #0cc0df;
                  border: 1px solid #0cc0df;
                  font-size: 15px;
                  font-weight: 500;
                  text-decoration: none;
                  padding: 13px 24px;
                  color: #ffffff;
                  display: inline-block;
                  border-radius: 4px;">
          Book New Appointment
        </a>
      </div>

      <div style="text-align: center; margin-top: 32px; color: #4a5568; font-size: 14px;">
        <p>Thank you for letting us know about your cancellation.</p>
        <p>We hope to serve you another time!</p>
      </div>
      <!-- Footer -->
<div style="text-align: center; margin-top: 32px; color: #4a5568; font-size: 14px;">
  <p>Thank you for choosing Markato Auto Detail!</p>
  <p>We look forward to serving you.</p>
  <p style="margin-top: 16px;">
    By booking with us, you agree to our 
    <a 
      href="${process.env.FRONTEND_URL}/communication-terms"
      target="_blank"
      rel="noopener noreferrer"
      style="color: #0cc0df; text-decoration: none; border-bottom: 1px solid #0cc0df;"
    >
      Communication Terms
    </a>
  </p>
</div>
    </div>
  `;
};

const createAdminCancellationEmailTemplate = (booking) => {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a202c; margin: 0 0 16px 0;">
          Booking Cancellation Notice
        </h1>
        <div style="color: #4a5568; font-size: 16px;">
          Booking #: <span style="color: #dc2626; font-family: monospace; font-weight: 600;">
            ${booking.confirmationNumber}
          </span>
        </div>
      </div>

      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Cancelled Booking Details
        </h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Customer:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${
              booking.name
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Contact:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${
              booking.contact
            }</td>
          </tr>
          ${
            booking.email
              ? `
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Email:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.email}</td>
          </tr>
          `
              : ""
          }
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Service:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.serviceName}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Date & Time:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.dateTime}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Vehicle:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.makeModel} (${booking.vehicleType})
            </td>
          </tr>
        </table>
      </div>

      <!-- Optional Services Section -->
      ${
        booking.optionalServices?.length > 0
          ? `
        <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-top: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
            Optional Services Cancelled
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${booking.optionalServices
              .map(
                (service) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${service.name}</td>
                <td style="text-align: right; padding: 8px; border: 1px solid #e2e8f0;">$${service.price}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        </div>
      `
          : ""
      }

      <!-- Total Amount Section -->
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 600; color: #1a202c;">Cancelled Amount:</span>
          <span style="color: #dc2626; font-size: 24px; font-weight: 600;">$${
            booking.totalPrice
          }</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="margin-top: 32px; text-align: center;">
        <a href="${process.env.FRONTEND_URL}/admin/bookings" 
           style="display: inline-block; padding: 12px 24px; background-color: #0cc0df; 
                  color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
          View in Dashboard
        </a>
      </div>

      <!-- Additional Notes -->
      <div style="margin-top: 24px; text-align: center; color: #4a5568; font-size: 14px;">
        <p>This slot is now available for new bookings.</p>
        <p>Cancellation was processed automatically through the customer cancellation link.</p>
      </div>
    </div>
  `;
};

const createStatusUpdateEmailTemplate = (booking, newStatus, note) => {
  const statusMessages = {
    pending: "Your booking is pending confirmation",
    confirmed: "Your booking has been confirmed",
    in_progress: "Your service is now in progress",
    completed: "Your service has been completed",
    cancelled: "Your booking has been cancelled",
  };

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <!-- Company Logo -->
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="data:image/png;base64,${JPG_MARKATO}"  
             alt="Markato Auto Detail" 
             style="height: 60px; width: auto;"
        />
      </div>

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a202c; margin: 0 0 16px 0;">
          Booking Status Update
        </h1>
        <div style="color: #4a5568; font-size: 16px;">
          Booking #: <span style="color: #0cc0df; font-family: monospace; font-weight: 600;">
            ${booking.confirmationNumber}
          </span>
        </div>
      </div>

      <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Status Update
        </h2>
        <p style="color: #1a202c; font-size: 16px; margin-bottom: 16px;">
          ${statusMessages[newStatus]}
        </p>
        ${
          note
            ? `
          <div style="margin-top: 16px; padding: 16px; background: #fff; border-radius: 4px;">
            <p style="color: #4a5568; margin: 0;">${note}</p>
          </div>
        `
            : ""
        }
      </div>

      <div style="background: #f8fafc; border-radius: 8px; padding: 24px;">
        <h3 style="font-size: 16px; font-weight: 600; color: #1a202c; margin: 0 0 16px 0;">
          Booking Details
        </h3>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Service:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.serviceName}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Date & Time:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">
              ${booking.dateTime}
            </td>
          </tr>
        </table>
      </div>
      <!-- Footer -->
<div style="text-align: center; margin-top: 32px; color: #4a5568; font-size: 14px;">
  <p>Thank you for choosing Markato Auto Detail!</p>
  <p>We look forward to serving you.</p>
  <p style="margin-top: 16px;">
    By booking with us, you agree to our 
    <a 
      href="${process.env.FRONTEND_URL}/communication-terms"
      target="_blank"
      rel="noopener noreferrer"
      style="color: #0cc0df; text-decoration: none; border-bottom: 1px solid #0cc0df;"
    >
      Communication Terms
    </a>
  </p>
</div>
    </div>
  `;
};

export const sendAdminNotification = async (booking) => {
  try {
    await resend.emails.send({
      from: `bookings@${process.env.RESEND_DOMAIN}`,
      to: [process.env.ADMIN_EMAIL],
      subject: `New Booking: ${booking.confirmationNumber} - ${booking.serviceName}`,
      html: createAdminEmailTemplate(booking),
      reply_to: booking.email,
    });
    return true;
  } catch (error) {
    console.error("Admin notification email failed:", error);
    return false;
  }
};

export const sendBookingConfirmation = async (booking) => {
  if (!booking.email) return;

  try {
    await resend.emails.send({
      from: `bookings@${process.env.RESEND_DOMAIN}`,
      to: [booking.email],
      subject: `Booking Confirmed - ${booking.confirmationNumber}`,
      html: createEmailTemplate(booking),
      reply_to:
        `bookings@${process.env.RESEND_DOMAIN}` || process.env.ADMIN_EMAIL,
    });

    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

export const sendCancellationConfirmation = async (booking) => {
  if (!booking.email) return;

  try {
    // Send confirmation to customer
    await resend.emails.send({
      from: `bookings@${process.env.RESEND_DOMAIN}`,
      to: [booking.email],
      subject: `Booking Cancellation Confirmed - ${booking.confirmationNumber}`,
      html: createCancellationEmailTemplate(booking),
      reply_to:
        `bookings@${process.env.RESEND_DOMAIN}` || process.env.ADMIN_EMAIL,
    });

    // Send notification to admin
    await resend.emails.send({
      from: `bookings@${process.env.RESEND_DOMAIN}`,
      to: [process.env.ADMIN_EMAIL],
      subject: `Booking Cancelled - ${booking.confirmationNumber}`,
      html: createAdminCancellationEmailTemplate(booking),
      reply_to: booking.email,
    });

    return true;
  } catch (error) {
    console.error("Cancellation email failed:", error);
    return false;
  }
};

export const sendStatusUpdateEmail = async (booking, newStatus, note) => {
  if (!booking.email) return;

  try {
    await resend.emails.send({
      from: `bookings@${process.env.RESEND_DOMAIN}`,
      to: [booking.email],
      subject: `Booking Status Update - ${booking.confirmationNumber}`,
      html: createStatusUpdateEmailTemplate(booking, newStatus, note),
      reply_to:
        `bookings@${process.env.RESEND_DOMAIN}` || process.env.ADMIN_EMAIL,
    });
    return true;
  } catch (error) {
    console.error("Status update email failed:", error);
    return false;
  }
};
