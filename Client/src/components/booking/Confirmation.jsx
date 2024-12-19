// src/components/booking/Confirmation.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Car,
  SprayCan,
  Phone,
  User,
  CheckCircle,
} from "lucide-react";

const Confirmation = ({ booking }) => {
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
        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-neutral-400">
          Confirmation number:{" "}
          <span className="text-orange-500 font-mono font-bold">
            {booking.confirmationNumber}
          </span>
        </p>
      </div>

      <div className="bg-neutral-800 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Booking Details</h3>

        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-orange-500" />
            <span>{booking.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-orange-500" />
            <span>{booking.contact}</span>
          </div>

          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-orange-500" />
            <div>
              <span>{booking.makeModel}</span>
              <span className="text-sm text-neutral-400 block">
                Type: {booking.vehicleType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span>{booking.dateTime}</span>
          </div>

          <div className="flex items-center gap-3">
            <SprayCan className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium">
                {booking.serviceName} - ${booking.servicePrice}
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                Selected scent: {booking.selectedScent}
              </p>
            </div>
          </div>

          {booking.optionalServices && booking.optionalServices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-700">
              <h4 className="text-lg font-medium mb-2">Optional Services</h4>
              {booking.optionalServices.map((service, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span className="text-orange-500">${service.price}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-neutral-700">
            <div className="flex justify-between font-bold">
              <span>Total Price:</span>
              <span className="text-orange-500">${booking.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-neutral-400 text-sm">
        <p>
          Please save your confirmation number:{" "}
          <span className="font-mono font-bold">
            {booking.confirmationNumber}
          </span>
        </p>
        <p>We look forward to servicing your vehicle at the scheduled time.</p>
        <p>Please arrive 5-10 minutes before your appointment time.</p>
      </div>

      <motion.button
        onClick={() => window.location.reload()}
        className="mt-8 bg-neutral-800 px-6 py-3 rounded-lg hover:bg-neutral-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Book Another Service
      </motion.button>
    </motion.div>
  );
};

export default Confirmation;