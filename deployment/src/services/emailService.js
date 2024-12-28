// src/services/emailService.js
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);


const formatPrice = (price) => {
  return ` $${price}`;
};

const createEmailTemplate = (booking) => {
  const optionalServicesSection = booking.optionalServices?.length > 0 
    ? `
      <div style="padding-top: 20px; margin-top: 20px; border-top: 1px solid #e2e8f0;">
        <h3 style="font-size: 20px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">
          Optional Services
        </h3>
        ${booking.optionalServices.map(service => `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #4a5568;">${service.name}</span>
            <span style="color: #0cc0df; font-weight: 500;">${formatPrice(service.price)}</span>
          </div>
        `).join('')}
      </div>
    ` 
    : '';

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <!-- Header with Simple Checkmark -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="margin-bottom: 24px;">
          <div style="width: 64px; height: 64px; margin: 0 auto; background-color: #0cc0df; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;">
            ✓
          </div>
        </div>
        <h1 style="font-size: 32px; font-weight: 700; color: #1a202c; margin: 0 0 16px 0;">
          Booking Confirmed!
        </h1>
        <div style="color: #4a5568; font-size: 16px;">
          Confirmation Number: 
          <span style="color: #0cc0df; font-family: monospace; font-weight: 600;">
            ${booking.confirmationNumber}
          </span>
        </div>
      </div>

      <!-- Main Card -->
      <div style="background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 600; color: #1a202c; margin: 0 0 24px 0;">
          Booking Details
        </h2>

        <!-- Customer Info -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="width: 20px; margin-right: 12px;">👤</span>
            <span style="color: #1a202c;">${booking.name}</span>
          </div>
          
          ${booking.email ? `
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="width: 20px; margin-right: 12px;">✉️</span>
            <a href="mailto:${booking.email}" style="color: #0cc0df; text-decoration: none;">${booking.email}</a>
          </div>
          ` : ''}
          
          <div style="display: flex; align-items: center;">
            <span style="width: 20px; margin-right: 12px;">📱</span>
            <span style="color: #4a5568;">${booking.contact}</span>
          </div>
        </div>

        <!-- Vehicle Info -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: start;">
            <span style="width: 20px; margin-right: 12px;">🚗</span>
            <div>
              <div style="color: #1a202c;">${booking.makeModel}</div>
              <div style="color: #4a5568; font-size: 14px;">Type: ${booking.vehicleType}</div>
            </div>
          </div>
        </div>

        <!-- Service Info -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: start;">
            <span style="width: 20px; margin-right: 12px;">🧼</span>
            <div>
              <div style="color: #1a202c;">
                ${booking.serviceName}${formatPrice(booking.servicePrice)}
              </div>
              <div style="color: #4a5568; font-size: 14px;">Scent: ${booking.selectedScent}</div>
            </div>
          </div>
        </div>

        <!-- Date & Time -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center;">
            <span style="width: 20px; margin-right: 12px;">📅</span>
            <span style="color: #1a202c;">${booking.dateTime}</span>
          </div>
        </div>

        ${optionalServicesSection}

        <!-- Total -->
        <div style="padding-top: 20px; margin-top: 20px; border-top: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 20px; font-weight: 600; color: #1a202c;">Total Amount:</span>
            <span style="color: #0cc0df; font-size: 24px; font-weight: 600;">${formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      <!-- Footer Notes -->
      <div style="background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <span style="width: 20px; margin-right: 12px;">⏰</span>
          <span style="color: #4a5568;">Please arrive 5-10 minutes before your appointment time.</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="width: 20px; margin-right: 12px;">📞</span>
          <span style="color: #4a5568;">If you have any questions, please don't hesitate to contact us.</span>
        </div>
      </div>
    </div>
  `;
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