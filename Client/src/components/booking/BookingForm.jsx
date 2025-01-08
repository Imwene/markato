// src/components/booking/BookingForm.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CONFIG } from "../../config/config";
const BookingForm = ({
  bookingDetails,
  onInputChange,
  captcha,
  onSubmit,
  isFormValid: parentIsFormValid,
  onBack,
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
    email: false,
  });
  const [slotAvailability, setSlotAvailability] = useState({});

  const phoneRegex =
    /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

  const isValidEmail = (email) => {
    if (!email) return true; // Empty email is valid since it's optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = parentIsFormValid && userCaptchaAnswer.trim().length > 0;

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

      // Format date in a standard way: YYYY-MM-DD
      const formattedDate = date.toISOString().split("T")[0];

      // Format display date
      const displayDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      dates.push({
        value: formattedDate, // This will be used for the actual value
        display: displayDate, // This will be shown to the user
      });
    }
    return dates;
  };

  const handleBlur = (fieldName) => {
    setTouchedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleBack = (e) => {
    e.preventDefault();
    onBack(); // This calls the passed onBack prop
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

  const updateDateTime = async (date, time) => {
    if (date && time) {
      const formattedDate = new Date(date);
      const combinedDateTime = `${formattedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })}, ${time}`;
  
      try {
        const response = await fetch(
          `${CONFIG.API_URL}/bookings/check-slot?dateTime=${encodeURIComponent(
            combinedDateTime
          )}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Slot availability response:', data); // Debug log
  
        if (!data.success) {
          throw new Error(data.error || 'Failed to check slot availability');
        }
  
        if (!data.available) {
          alert(`This time slot is fully booked (${data.currentBookings}/${data.maxBookingsPerSlot} bookings). Please select another time.`);
          setSelectedTime(null);
          return;
        }
  
        // Update the booking details with the new dateTime
        onInputChange({
          target: {
            name: "dateTime",
            value: combinedDateTime,
          },
        });
  
        // Update touched fields state
        setTouchedFields((prev) => ({
          ...prev,
          date: true,
          time: true,
        }));
      } catch (error) {
        console.error("Error checking slot availability:", error);
        alert(`Error checking time slot availability: ${error.message}`);
        setSelectedTime(null);
      }
    }
  };

  const hasAllRequiredFields = 
  bookingDetails.name?.trim() &&
  bookingDetails.contact?.trim() &&
  bookingDetails.makeModel?.trim() &&
  selectedDate &&
  selectedTime &&
  userCaptchaAnswer.trim();

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setTouchedFields({
      ...touchedFields,
      email: true,
      captcha: true, // Make sure to mark captcha as touched
    });

    if (
      hasAllRequiredFields &&
      (!bookingDetails.email || isValidEmail(bookingDetails.email))
    ) {
      const answer = userCaptchaAnswer.trim();
      onSubmit(answer);
    }
  };

  const isValidPhoneNumber = (phone) => phoneRegex.test(phone);

  const inputClassName = `
  w-full p-3 rounded-lg shadow-sm transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-orange-500
  bg-white dark:bg-stone-800 
  text-content-DEFAULT dark:text-white 
  placeholder:text-content-light dark:placeholder:text-stone-400
  hover:bg-gray-50 dark:hover:bg-stone-700/50
`;

  const selectClassName = `
  w-full p-3 rounded-lg shadow-sm transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-orange-500
  bg-white dark:bg-stone-800 
  text-content-DEFAULT dark:text-white 
  placeholder:text-content-light dark:placeholder:text-stone-400
  hover:bg-gray-50 dark:hover:bg-stone-700/50
`;

  const renderTimeOptions = () => {
    return businessHours.map((time, index) => {
      const isAvailable =
        slotAvailability[`${selectedDate}, ${time}`]?.available !== false;
      return (
        <option key={index} value={time} disabled={!isAvailable}>
          {time} {!isAvailable ? "(Fully Booked)" : ""}
        </option>
      );
    });
  };

  return (
    <div className="relative">
      {" "}
      {/* Added padding bottom for sticky buttons */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-content-dark dark:text-white">
          Booking Details
        </h2>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4"
          noValidate
        >
          {/* Your form fields here */}
          <div className="space-y-4">
            {/* Name field */}
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
                className={inputClassName}
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

            {/* Contact field */}
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
                className={inputClassName}
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

            {/* Email field */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address (Optional)"
                value={bookingDetails.email || ""}
                onChange={onInputChange}
                onBlur={() => handleBlur("email")}
                className={inputClassName}
                aria-describedby="emailError"
              />
              {touchedFields.email &&
                bookingDetails.email &&
                !isValidEmail(bookingDetails.email) && (
                  <span className="text-red-500 text-sm mt-1" id="emailError">
                    Please enter a valid email address
                  </span>
                )}
            </div>

            {/* Car Make and Model field */}
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
                className={inputClassName}
                aria-describedby="makeModelError"
              />
              {touchedFields.makeModel &&
                bookingDetails.makeModel.length === 0 && (
                  <span
                    className="text-red-500 text-sm mt-1"
                    id="makeModelError"
                  >
                    Car make and model is required
                  </span>
                )}
            </div>

            {/* Date and Time Selection */}
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
                  className={selectClassName}
                  aria-describedby="dateError"
                >
                  <option value="" disabled>
                    Select Date
                  </option>
                  {generateDates().map((date, index) => (
                    <option key={index} value={date.value}>
                      {date.display}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-light dark:text-stone-400 pointer-events-none" />
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
                  className={selectClassName}
                  aria-describedby="timeError"
                >
                  <option value="" disabled>
                    Select Time
                  </option>
                  {renderTimeOptions()}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-content-light" />
                </div>
                {touchedFields.time && !selectedTime && (
                  <span className="text-red-500 text-sm mt-1" id="timeError">
                    Please select a time
                  </span>
                )}
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="p-4 rounded-lg border-2 border-border-DEFAULT dark:border-stone-700 bg-background-DEFAULT dark:bg-stone-800">
              <label
                htmlFor="captcha"
                className="block mb-2 font-medium text-content-dark dark:text-white"
              >
                {captcha.question}
              </label>
              <input
                type="text"
                id="captcha"
                value={userCaptchaAnswer}
                onChange={(e) => setUserCaptchaAnswer(e.target.value)}
                onBlur={() => handleBlur("captcha")}
                required
                className={inputClassName}
                placeholder="Enter CAPTCHA answer"
                aria-describedby="captchaError"
              />
              {touchedFields.captcha && !userCaptchaAnswer && (
                <span className="text-red-500 text-sm mt-1" id="captchaError">
                  Please answer the CAPTCHA
                </span>
              )}
            </div>
          </div>
        </form>
      </motion.div>
      {/* Navigation Buttons - Change from fixed to sticky */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-stone-900/95 backdrop-blur-sm border-t border-border-light dark:border-stone-700">
      <div className="max-w-[1000px] mx-auto space-y-3">
        <motion.button
          type="button"
          onClick={handleSubmitForm}
          disabled={!isFormValid}
          className={`w-full p-3 rounded-lg transition-colors duration-200 ${
            isFormValid
              ? "bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600"
              : "bg-background-dark dark:bg-stone-800 text-content-light dark:text-stone-500 cursor-not-allowed"
          }`}
          whileHover={isFormValid ? { scale: 1.02 } : {}}
          whileTap={isFormValid ? { scale: 0.98 } : {}}
        >
          {hasAllRequiredFields
            ? "Complete Booking"
            : "Please Fill All Required Fields"}
        </motion.button>
          <motion.button
            type="button"
            onClick={handleBack}
            className="w-full p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 text-content-DEFAULT dark:text-white border border-border-DEFAULT dark:border-stone-700 hover:bg-background-dark dark:hover:bg-stone-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Addons
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
