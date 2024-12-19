// src/components/booking/BookingForm.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const BookingForm = ({
  bookingDetails,
  onInputChange,
  captcha,
  onSubmit,
  isFormValid,
}) => {
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    contact: false,
    makeModel: false,
    date: false,
    time: false,
    captcha: false,
  });

  // US phone number validation regex
  const phoneRegex = /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

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
  ];

  const generateDates = () => {
    const dates = [];
    const current = new Date();

    for (let i = 1; i < 8; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      dates.push(
        date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    }
    return dates;
  };

  const handleBlur = (fieldName) => {
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    updateDateTime(date, selectedTime);
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);
    updateDateTime(selectedDate, time);
  };

  const updateDateTime = (date, time) => {
    if (date && time) {
      const combinedDateTime = `${date}, ${time}`;
      onInputChange({
        target: {
          name: "dateTime",
          value: combinedDateTime,
        },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouchedFields({
      name: true,
      contact: true,
      makeModel: true,
      date: true,
      time: true,
      captcha: true,
    });

    if (e.target.checkValidity()) {
      await onSubmit(userCaptchaAnswer);
    }
  };

  const isValidPhoneNumber = (phone) => {
    return phoneRegex.test(phone);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Booking Details</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="name" className="sr-only">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your Name"
              value={bookingDetails.name}
              onChange={onInputChange}
              onBlur={() => handleBlur("name")}
              required
              minLength={2}
              pattern="^[a-zA-Z\s]*$"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-neutral-800"
              aria-describedby="nameError"
            />
            {touchedFields.name && bookingDetails.name.length === 0 && (
              <span className="text-red-500 text-sm mt-1" id="nameError">
                Name is required
              </span>
            )}
            {touchedFields.name &&
              bookingDetails.name.length > 0 &&
              !bookingDetails.name.match(/^[a-zA-Z\s]*$/) && (
                <span className="text-red-500 text-sm mt-1" id="nameError">
                  Please enter a valid name (letters only)
                </span>
              )}
          </div>

          <div className="relative">
            <label htmlFor="contact" className="sr-only">
              Contact Number
            </label>
            <input
              type="tel"
              id="contact"
              name="contact"
              placeholder="Contact Number (e.g., 123-456-7890)"
              value={bookingDetails.contact}
              onChange={onInputChange}
              onBlur={() => handleBlur("contact")}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-neutral-800"
              aria-describedby="contactError"
            />
            {touchedFields.contact && bookingDetails.contact.length === 0 && (
              <span className="text-red-500 text-sm mt-1" id="contactError">
                Phone number is required
              </span>
            )}
            {touchedFields.contact &&
              bookingDetails.contact.length > 0 &&
              !isValidPhoneNumber(bookingDetails.contact) && (
                <span className="text-red-500 text-sm mt-1" id="contactError">
                  Please enter a valid US phone number (e.g., 123-456-7890)
                </span>
              )}
          </div>

          <div className="relative">
            <label htmlFor="makeModel" className="sr-only">
              Car Make and Model
            </label>
            <input
              type="text"
              id="makeModel"
              name="makeModel"
              placeholder="Car Make and Model"
              value={bookingDetails.makeModel}
              onChange={onInputChange}
              onBlur={() => handleBlur("makeModel")}
              required
              minLength={2}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-neutral-800"
              aria-describedby="makeModelError"
            />
            {touchedFields.makeModel &&
              bookingDetails.makeModel.length === 0 && (
                <span className="text-red-500 text-sm mt-1" id="makeModelError">
                  Car make and model is required
                </span>
              )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <label htmlFor="date" className="sr-only">
                Select Date
              </label>
              <select
                id="date"
                value={selectedDate || ""}
                onChange={handleDateChange}
                onBlur={() => handleBlur("date")}
                required
                className="w-full p-3 pl-4 pr-10 border rounded-lg bg-neutral-800 focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer hover:bg-neutral-700 transition-colors"
                aria-describedby="dateError"
              >
                <option value="" disabled>
                  Select Date
                </option>
                {generateDates().map((date, index) => (
                  <option key={index} value={date}>
                    {date}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              {touchedFields.date && !selectedDate && (
                <span className="text-red-500 text-sm mt-1" id="dateError">
                  Please select a date
                </span>
              )}
            </div>

            <div className="relative flex-1">
              <label htmlFor="time" className="sr-only">
                Select Time
              </label>
              <select
                id="time"
                value={selectedTime || ""}
                onChange={handleTimeChange}
                onBlur={() => handleBlur("time")}
                required
                className="w-full p-3 pl-4 pr-10 border rounded-lg bg-neutral-800 focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer hover:bg-neutral-700 transition-colors"
                aria-describedby="timeError"
              >
                <option value="" disabled>
                  Select Time
                </option>
                {businessHours.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              {touchedFields.time && !selectedTime && (
                <span className="text-red-500 text-sm mt-1" id="timeError">
                  Please select a time
                </span>
              )}
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <label htmlFor="captcha" className="block mb-2 font-semibold">
              {captcha.question}
            </label>
            <input
              type="text"
              id="captcha"
              value={userCaptchaAnswer}
              onChange={(e) => setUserCaptchaAnswer(e.target.value)}
              onBlur={() => handleBlur("captcha")}
              required
              className="w-full p-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-neutral-800"
              placeholder="Enter CAPTCHA answer"
              aria-describedby="captchaError"
            />
            {touchedFields.captcha && !userCaptchaAnswer && (
              <span className="text-red-500 text-sm mt-1" id="captchaError">
                Please answer the CAPTCHA
              </span>
            )}
          </div>
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800">
            <motion.button
              type="submit"
              className={`w-full p-3 rounded-lg transition-colors duration-200 ${
                isFormValid && userCaptchaAnswer && selectedDate && selectedTime
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
              }`}
              disabled={
                !isFormValid ||
                !userCaptchaAnswer ||
                !selectedDate ||
                !selectedTime
              }
              whileHover={
                isFormValid && userCaptchaAnswer ? { scale: 1.05 } : {}
              }
              whileTap={isFormValid && userCaptchaAnswer ? { scale: 0.95 } : {}}
            >
              Complete Booking
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default BookingForm;