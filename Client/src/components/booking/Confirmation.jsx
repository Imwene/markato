// src/components/booking/Confirmation.jsx
import React from "react";
import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import {
  Calendar,
  Clock,
  Car,
  SprayCan,
  Phone,
  User,
  CheckCircle,
} from "lucide-react";
import { CONFIG } from "../../config/config";
import api from "../../utils/api";

const Confirmation = ({ booking }) => {
  const handleDownload = async () => {
    try {
      //console.log('Attempting to download PDF for:', booking.confirmationNumber);

      // Use api utility but specify response type as blob
      const response = await fetch(
        `${CONFIG.API_URL}${CONFIG.ENDPOINTS.BOOKINGS.PDF(
          booking.confirmationNumber
        )}`,
        {
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `booking-${booking.confirmationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download confirmation. Please try again.");
    }
  };
  const handleResendEmail = async () => {
    try {
      const response = await fetch(
        `${CONFIG.API_URL}/bookings/${booking.confirmationNumber}/resend-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        alert("Email sent successfully!");
      } else {
        throw new Error(data.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  if (!booking) {
    return (
      <div className="text-center py-8 text-red-500">
        Booking information not available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <div
          className="w-16 h-16 bg-primary-light dark:bg-orange-500 rounded-full mx-auto 
                  flex items-center justify-center mb-4"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-content-dark dark:text-white">
          Booking Confirmed!
        </h2>
        <p className="text-lg text-content-light dark:text-stone-400">
          Confirmation number:{" "}
          <span className="text-primary-DEFAULT dark:text-orange-500 font-mono font-bold">
            {booking.confirmationNumber}
          </span>
        </p>
      </div>

      <div
        className="bg-background-DEFAULT dark:bg-stone-800 rounded-lg p-6 mb-8 
                border border-border-light dark:border-stone-700 shadow-sm"
      >
        <h3 className="text-2xl font-semibold mb-6 text-content-dark dark:text-white">
          Booking Details
        </h3>

        <div className="space-y-6 text-left">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary-light dark:text-orange-500" />
            <span className="text-content-DEFAULT dark:text-white">
              {booking.name}
            </span>
            {booking.email && (
              <span className="text-sm text-content-light block">
                {booking.email}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary-light dark:text-orange-500" />
            <span className="text-content-DEFAULT dark:text-white">
              {booking.contact}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-primary-light dark:text-orange-500" />
            <div>
              <span className="text-content-DEFAULT dark:text-white">
                {booking.makeModel}
              </span>
              <span className="text-sm text-content-light block">
                Type: {booking.vehicleType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary-light dark:text-orange-500" />
            <span className="text-content-DEFAULT dark:text-white">
              {booking.dateTime}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <SprayCan className="w-5 h-5 text-primary-light dark:text-orange-500" />
            <div>
              <p className="font-medium text-content-DEFAULT">
                {booking.serviceName} - ${booking.servicePrice}
              </p>
              <p className="text-sm text-content-light mt-1">
                Selected scent: {booking.selectedScent}
              </p>
            </div>
          </div>

          {booking.optionalServices && booking.optionalServices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-light dark:border-stone-700">
              <h4 className="text-lg font-medium mb-2 text-content-dark dark:text-white">
                Optional Services
              </h4>
              {booking.optionalServices.map((service, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-content-DEFAULT dark:text-stone-300">
                    {service.name}
                  </span>
                  <span className="text-primary-DEFAULT dark:text-orange-500">
                    ${service.price}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border-light dark:border-stone-700">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-content-dark dark:text-white">
                Total Price:
              </span>
              <span className="text-primary-DEFAULT dark:text-orange-500">
                ${booking.totalPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 
          bg-primary-light dark:bg-orange-500 text-white rounded-lg 
          hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
          transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Confirmation
        </button>
        {booking.email && (
          <button
            onClick={handleResendEmail}
            className="flex items-center gap-2 px-4 py-2 
            bg-background-DEFAULT dark:bg-stone-800 
            text-content-DEFAULT dark:text-white 
            border border-border-DEFAULT dark:border-stone-700 rounded-lg 
            hover:bg-background-dark dark:hover:bg-stone-700 
            transition-colors"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </button>
        )}
      </div>

      <div className="space-y-4 text-content-light text-base mt-10">
        <p>
          Please save your confirmation number:{" "}
          <span className="font-mono font-bold text-primary-DEFAULT">
            {booking.confirmationNumber}
          </span>
        </p>
        <p>We look forward to servicing your vehicle at the scheduled time.</p>
        <p>Please arrive 5-10 minutes before your appointment time.</p>
      </div>

      <motion.button
        onClick={() => window.location.reload()}
        className="mt-8 bg-background-DEFAULT border border-border-DEFAULT px-6 py-3 rounded-lg 
                 hover:bg-background-dark transition-colors text-content-DEFAULT"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Book Another Service
      </motion.button>
    </motion.div>
  );
};

export default Confirmation;
