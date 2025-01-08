// src/components/CancellationPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CONFIG } from "../config/config";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";

const CancellationPage = () => {
  const { confirmationNumber, email } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(
          `${CONFIG.API_URL}/bookings/check-cancellation/${confirmationNumber}/${email}`
        );
        const data = await response.json();

        if (data.success) {
          setBooking(data.booking);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [confirmationNumber, email]);

  const handleCancellation = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${CONFIG.API_URL}/bookings/cancel/${confirmationNumber}/${email}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setCancelled(true);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-content-dark dark:text-white mb-4">
            Unable to Process Request
          </h1>
          <p className="text-content-light dark:text-stone-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary-light dark:bg-orange-500 text-white rounded-lg 
                     hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-content-dark dark:text-white mb-4">
            Booking Cancelled Successfully
          </h1>
          <p className="text-content-light dark:text-stone-400 mb-6">
            Your booking has been cancelled. You will receive a confirmation
            email shortly.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary-light dark:bg-orange-500 text-white rounded-lg 
                     hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors"
          >
            Book Another Service
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white dark:bg-stone-800 rounded-lg shadow-lg p-6"
      >
        <h1 className="text-2xl font-bold text-content-dark dark:text-white mb-6">
          Cancel Your Booking
        </h1>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary-light dark:text-orange-500 mt-1" />
            <div>
              <p className="font-medium text-content-dark dark:text-white">
                Appointment Details
              </p>
              <p className="text-content-light dark:text-stone-400">
                {booking.dateTime}
              </p>
            </div>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Warning: This action cannot be undone
            </p>
            <p className="text-sm text-red-500 dark:text-red-300 mt-1">
              Cancelling this booking will immediately free up this time slot
              for other customers.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCancellation}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg 
                     hover:bg-red-600 transition-colors"
          >
            Cancel Booking
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 bg-background-DEFAULT dark:bg-stone-700 
                     text-content-DEFAULT dark:text-white rounded-lg 
                     hover:bg-background-dark dark:hover:bg-stone-600 
                     transition-colors"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CancellationPage;
