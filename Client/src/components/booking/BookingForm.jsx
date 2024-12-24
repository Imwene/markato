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

  const phoneRegex =
    /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

  const isValidEmail = (email) => {
    if (!email) return true; // Empty email is valid since it's optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  const updateDateTime = (date, time) => {
    if (date && time) {
      // Format the datetime in a standard way
      const formattedDate = new Date(date);
      const combinedDateTime = `${formattedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })}, ${time}`;

      onInputChange({
        target: {
          name: "dateTime",
          value: combinedDateTime,
        },
      });
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setTouchedFields({
      ...touchedFields,
      email: true
    });
  
    if (isFormValid && (!bookingDetails.email || isValidEmail(bookingDetails.email))) {
      const answer = userCaptchaAnswer.trim();
      onSubmit(answer);
    }
  };

  const isValidPhoneNumber = (phone) => phoneRegex.test(phone);

  const selectClassName = `
    w-full p-3 pl-4 pr-10 border border-border-DEFAULT rounded-lg 
    bg-background-light focus:ring-2 focus:ring-primary-light 
    text-content-DEFAULT appearance-none cursor-pointer 
    hover:border-border-dark transition-colors
  `;

  const inputClassName = `
    w-full p-3 border rounded-lg focus:outline-none focus:ring-2 
    focus:ring-primary-light bg-background-light border-border-DEFAULT
    text-content-DEFAULT placeholder:text-content-light
  `;

  return (
    <div className="relative pb-32">
      {" "}
      {/* Added padding bottom for sticky buttons */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-content-dark">
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
                  <ChevronDown className="h-4 w-4 text-content-light" />
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
                  {businessHours.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
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
            <div className="bg-background-DEFAULT p-4 rounded-lg border border-border-DEFAULT">
              <label
                htmlFor="captcha"
                className="block mb-2 font-semibold text-content-dark"
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
      {/* Navigation Buttons - Outside form but inside container */}
      {/* <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/95 backdrop-blur-sm border-t border-border-light">
        <div className="max-w-[1000px] mx-auto space-y-3">
          <motion.button
            type="button"
            onClick={handleSubmitForm}
            disabled={!isFormValid}
            className={`w-full p-3 rounded-lg transition-colors duration-200 ${
              isFormValid
                ? "bg-primary-light text-white hover:bg-primary-DEFAULT"
                : "bg-background-dark text-content-light cursor-not-allowed"
            }`}
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
          >
            Complete Booking
          </motion.button>
          <motion.button
            type="button"
            onClick={onBack}
            className="w-full p-3 rounded-lg bg-background-DEFAULT text-content-DEFAULT border border-border-DEFAULT hover:bg-background-dark transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Addons
          </motion.button>
        </div>
      </div> */}
      {/* Navigation Buttons - Change from fixed to sticky */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 backdrop-blur-sm border-t border-border-light">
        <div className="max-w-[1000px] mx-auto space-y-3">
          <motion.button
            type="button"
            onClick={handleSubmitForm}
            disabled={!isFormValid}
            className={`w-full p-3 rounded-lg transition-colors duration-200 ${
              !isFormValid // Changed condition here
                ? "bg-background-dark text-content-light cursor-not-allowed"
                : "bg-primary-light text-white hover:bg-primary-DEFAULT"
            }`}
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
          >
            Complete Booking
          </motion.button>
          <motion.button
            type="button"
            onClick={handleBack}
            className="w-full p-3 rounded-lg bg-background-DEFAULT text-content-DEFAULT border border-border-DEFAULT hover:bg-background-dark transition-colors duration-200"
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
