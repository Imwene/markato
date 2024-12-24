// src/services/emailService.js
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';

dotenv.config();



const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY 
});


const createEmailTemplate = (booking) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0cc0df;">Booking Confirmation</h1>
      <p>Dear ${booking.name},</p>
      <p>Thank you for choosing our services. Your booking has been confirmed.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #333;">Booking Details</h2>
        <p><strong>Confirmation Number:</strong> ${booking.confirmationNumber}</p>
        <p><strong>Service:</strong> ${booking.serviceName}</p>
        <p><strong>Scent:</strong> ${booking.selectedScent}</p>
        <p><strong>Optional Services:</strong> ${booking.optionalServices}</p>
        <p><strong>Date & Time:</strong> ${booking.dateTime}</p>
        <p><strong>Vehicle:</strong> ${booking.makeModel} (${booking.vehicleType})</p>
        <p><strong>Total Amount:</strong> $${booking.totalPrice}</p>
      </div>
      
      <p>If you have any questions, please contact us.</p>
    </div>
  `;
};

export const sendBookingConfirmation = async (booking) => {
    if (!booking.email) return;

    try {
      const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: process.env.EMAIL_USER || 'markatoautodetailing@gmail.com',
        to: [booking.email], // Use an array for recipients
        subject: `Booking Confirmation - ${booking.confirmationNumber}`,
        text: createEmailTemplate(booking), // You can use text or html
        html: createEmailTemplate(booking)
      });
  
      console.log('Mailgun response:', response); 
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
};