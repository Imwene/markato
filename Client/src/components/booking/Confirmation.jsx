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
  if (!booking) return null;

  // // Function to format the datetime for display
  // const formatDateTime = (dateTimeStr) => {
  //   try {
  //     const [date, time] = dateTimeStr.split(" ");
  //     return {
  //       date,
  //       time,
  //     };
  //   } catch (error) {
  //     return { date: "N/A", time: "N/A" };
  //   }
  // };

  // const { date, time } = formatDateTime(booking.dateTime);

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
          <span className="text-orange-500 font-mono">
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
            <span>{booking.makeModel}</span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span>{booking.dateTime}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <span>Estimated duration: {booking.estimatedDuration}</span>
          </div>

          <div className="flex items-center gap-3">
            <SprayCan className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium">{booking.service?.name}</p>
              <p className="text-sm text-neutral-400">
                {booking.service?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-neutral-400 text-sm">
        <p>
          A confirmation email has been sent to your registered email address.
        </p>
        <p>
          Our team will contact you at {booking.contact} if any changes are
          needed.
        </p>
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
