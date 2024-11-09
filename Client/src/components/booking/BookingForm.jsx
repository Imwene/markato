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

  const businessHours = [
    "8:00 AM",
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

    for (let i = 0; i < 7; i++) {
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

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    onInputChange({
      target: {
        name: "dateTime",
        value: e.target.value,
      },
    });
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    onInputChange({
      target: {
        name: "dateTime",
        value: e.target.value,
      },
    });
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Booking Details</h2>

      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={bookingDetails.name}
        onChange={onInputChange}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-neutral-800"
      />

      <input
        type="tel"
        name="contact"
        placeholder="Contact Number"
        value={bookingDetails.contact}
        onChange={onInputChange}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-neutral-800"
      />

      <input
        type="text"
        name="makeModel"
        placeholder="Car Make and Model"
        value={bookingDetails.makeModel}
        onChange={onInputChange}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-neutral-800"
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={selectedDate || ""}
            onChange={handleDateChange}
            className="w-full p-3 pl-4 pr-10 border rounded-lg bg-neutral-800 focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer hover:bg-neutral-700 transition-colors"
          >
            <option value="" disabled>
              Select Date
            </option>
            {generateDates().map((date, index) => (
              <option
                key={index}
                value={date}
                className="bg-neutral-800 hover:bg-neutral-700"
              >
                {date}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="relative flex-1">
          <select
            value={selectedTime || ""}
            onChange={handleTimeChange}
            className="w-full p-3 pl-4 pr-10 border rounded-lg bg-neutral-800 focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer hover:bg-neutral-700 transition-colors"
          >
            <option value="" disabled>
              Select Time
            </option>
            {businessHours.map((time, index) => (
              <option
                key={index}
                value={time}
                className="bg-neutral-800 hover:bg-neutral-700"
              >
                {time}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-neutral-800 p-4 rounded-lg mt-4 border border-neutral-700">
        <p className="mb-2 font-semibold">{captcha.question}</p>
        <input
          type="text"
          value={userCaptchaAnswer}
          onChange={(e) => setUserCaptchaAnswer(e.target.value)}
          className="w-full p-3 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-neutral-800"
          placeholder="Enter CAPTCHA answer"
        />
      </div>

      <motion.button
        onClick={() => onSubmit(userCaptchaAnswer)}
        className={`w-full p-3 rounded-lg transition-colors duration-200 ${
          isFormValid && userCaptchaAnswer && selectedDate && selectedTime
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
        }`}
        disabled={
          !isFormValid || !userCaptchaAnswer || !selectedDate || !selectedTime
        }
        whileHover={isFormValid && userCaptchaAnswer ? { scale: 1.05 } : {}}
        whileTap={isFormValid && userCaptchaAnswer ? { scale: 0.95 } : {}}
      >
        Complete Booking
      </motion.button>
    </motion.div>
  );
};

export default BookingForm;
