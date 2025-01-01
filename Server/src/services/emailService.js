// src/services/emailService.js
import { Resend } from 'resend';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-load the image at startup
const logoPath = path.join(__dirname, 'png_markato.png');
const PNG_MARKATO = fs.readFileSync(logoPath).toString('base64');
console.log('Logo loaded:', PNG_MARKATO.length);

const resend = new Resend(process.env.RESEND_API_KEY);


const formatPrice = (price) => {
  return ` $${price}`;
}; 

const createAdminEmailTemplate = (booking) => {
  const optionalServicesSection = booking.optionalServices?.length > 0 
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
          ${booking.optionalServices.map(service => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${service.name}</td>
              <td style="text-align: right; padding: 8px; border: 1px solid #e2e8f0;">$${service.price}</td>
            </tr>
          `).join('')}
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
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Contact:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.contact}</td>
          </tr>
          ${booking.email ? `
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Email:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.email}</td>
          </tr>
          ` : ''}
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
          <span style="color: #0cc0df; font-size: 24px; font-weight: 600;">$${booking.totalPrice}</span>
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

  const optionalServicesSection = booking.optionalServices?.length > 0 
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
          ${booking.optionalServices.map(service => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${service.name}</td>
              <td style="text-align: right; padding: 8px; border: 1px solid #e2e8f0;">$${service.price}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    ` 
    : '<p style="color: #64748b;">No optional services selected</p>';

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
    <!-- Company Logo -->
    <div style="text-align: center; margin-bottom: 24px;">
        <img src="data:image/png;base64,${PNG_MARKATO}"  
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
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Contact:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.contact}</td>
          </tr>
          ${booking.email ? `
          <tr>
            <td style="padding: 8px 0; color: #4a5568;">Email:</td>
            <td style="padding: 8px 0; color: #1a202c; font-weight: 500;">${booking.email}</td>
          </tr>
          ` : ''}
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
          <span style="color: #0cc0df; font-size: 24px; font-weight: 600;">$${booking.totalPrice}</span>
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

      <!-- Footer -->
      <div style="text-align: center; margin-top: 32px; color: #4a5568; font-size: 14px;">
        <p>Thank you for choosing Markato Auto Detail!</p>
        <p>We look forward to serving you.</p>
      </div>
    </div>
  `;
};

export const sendAdminNotification = async (booking) => {
  try {
    await resend.emails.send({
      from: `booking@${process.env.RESEND_DOMAIN}`,
      to: [process.dotenv.ADMIN_EMAIL],
      subject: `New Booking: ${booking.confirmationNumber} - ${booking.serviceName}`,
      html: createAdminEmailTemplate(booking),
      reply_to: booking.email || ADMIN_EMAIL
    });
    return true;
  } catch (error) {
    console.error('Admin notification email failed:', error);
    return false;
  }
};

export const sendBookingConfirmation = async (booking) => {
  if (!booking.email) return;

  try {
    await resend.emails.send({
      from: `booking@${process.env.RESEND_DOMAIN}`,
      to: [booking.email],
      subject: `Booking Confirmed - ${booking.confirmationNumber}`,
      html: createEmailTemplate(booking),
      reply_to: "markatoautodetail@gmail.com" 
    });

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};