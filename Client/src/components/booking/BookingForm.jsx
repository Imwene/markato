import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { ChevronDown, MapPin, AlertTriangle } from "lucide-react";
import { CONFIG } from "../../config/config";
import AddressInput from "./AddressInput";
import {
  formatToPacificDate,
  getCurrentPacificDate,
  formatToPacificDateTime,
} from "../../utils/dateUtils";

const BookingForm = ({
  bookingDetails,
  onInputChange,
  captcha,
  onSubmit,
  isFormValid: parentIsFormValid,
  onBack,
  serviceType = "drive-in",
  customerAddress = "",
  addressValidation = null,
  onAddressChange,
  onValidateAddress,
}) => {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: bookingDetails.name || "",
      contact: bookingDetails.contact || "",
      email: bookingDetails.email || "",
      makeModel: bookingDetails.makeModel || "",
      date: "",
      time: "",
      captchaAnswer: "",
    },
  });

  // State for availability checking
  const [timeSlots, setTimeSlots] = useState({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const watchedDate = watch("date");
  const watchedTime = watch("time");

  // Business hours
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
    "6:00 PM",
  ];

  // NEW: Enhanced form validation rules with mobile service validation
  const validationRules = {
    name: {
      required: "Name is required",
      pattern: {
        value: /^[a-zA-Z\s]*$/,
        message: "Please enter a valid name (letters only)",
      },
      minLength: {
        value: 2,
        message: "Name must be at least 2 characters long",
      },
    },
    contact: {
      required: "Phone number is required",
      pattern: {
        value: /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
        message: "Please enter a valid US phone number (e.g., 123-456-7890)",
      },
    },
    email: {
      required: "Email address is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
      },
    },
    makeModel: {
      required: "Vehicle make and model is required",
      minLength: {
        value: 2,
        message: "Please provide more details about your vehicle",
      },
    },
    date: {
      required: "Please select a date",
    },
    time: {
      required: "Please select a time",
    },
    captchaAnswer: {
      required: "Please solve the captcha",
      validate: (value) => {
        return value === captcha?.answer || "Incorrect captcha answer";
      },
    },
  };

  // Generate available dates
  const generateDates = (unavailableDay = 2) => {
    const dates = [];
    const current = getCurrentPacificDate();

    for (let i = 1; i < 8; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);

      const formattedDate = formatToPacificDate(date);
      const displayDate = formattedDate;
      const isDisabled =
        unavailableDay !== null && date.getDay() === unavailableDay;

      dates.push({
        value: formattedDate,
        display: displayDate,
        disabled: isDisabled,
        disabledReason: isDisabled
          ? `Closed on ${getDayName(unavailableDay)}`
          : "",
      });
    }
    return dates;
  };

  // Helper function to get day name
  const getDayName = (dayIndex) => {
    const days = [
      "Sundays",
      "Mondays",
      "Tuesdays",
      "Wednesdays",
      "Thursdays",
      "Fridays",
      "Saturdays",
    ];
    return days[dayIndex] || "this day";
  };

  // Date availability checking
  const checkDateAvailability = async (date) => {
    if (!date) return;

    setIsCheckingAvailability(true);
    try {
      const response = await fetch(
        `${CONFIG.API_URL}/bookings/check-date-slots?date=${encodeURIComponent(
          date
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTimeSlots(data.slots);
    } catch (error) {
      console.error("Error checking availability:", error);
      setTimeSlots({});
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Watch for date changes
  useEffect(() => {
    if (watchedDate) {
      checkDateAvailability(watchedDate);
    }
  }, [watchedDate]);

  // Check single slot availability
  const checkSlotAvailability = async (date, time) => {
    if (!date || !time) return false;

    const selectedDate = new Date(date);
    const formattedDateTime = formatToPacificDateTime(selectedDate, time);

    try {
      const response = await fetch(
        `${CONFIG.API_URL}/bookings/check-slot?dateTime=${encodeURIComponent(
          formattedDateTime
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.available) {
        setValue("time", "");
        return false;
      }

      onInputChange({
        target: {
          name: "dateTime",
          value: formattedDateTime,
        },
      });

      return true;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      setValue("time", "");
      return false;
    }
  };

  // NEW: Enhanced form submission handler with mobile service validation
  const onFormSubmit = async (data) => {
    try {
      // Validate all fields before submission
      const isFormValid = await trigger();
      if (!isFormValid) return;

      // NEW: Mobile service specific validation
      if (serviceType === "mobile") {
        if (
          !customerAddress ||
          !addressValidation ||
          addressValidation.status !== "valid"
        ) {
          setError("root.addressError", {
            type: "manual",
            message: "A valid service address is required for mobile bookings",
          });
          return;
        }
      }

      // Create a new Date object from the selected date
      const selectedDate = new Date(data.date);
      const formattedDateTime = formatToPacificDateTime(
        selectedDate,
        data.time
      );

      // Check final availability with proper date
      const isSlotAvailable = await checkSlotAvailability(data.date, data.time);
      if (!isSlotAvailable) {
        setError("time", {
          type: "manual",
          message: "This time slot is no longer available",
        });
        return;
      }

      // NEW: Create complete booking data with mobile service fields
      const bookingData = {
        ...data,
        dateTime: formattedDateTime,
        // Include mobile service data if applicable
        ...(serviceType === "mobile" &&
          addressValidation?.status === "valid" && {
            serviceAddress: customerAddress,
            addressValidation: addressValidation,
          }),
      };

      // Submit booking
      const result = await onSubmit(bookingData);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to create booking");
      }
    } catch (error) {
      setError("root.serverError", {
        type: "manual",
        message: error.message || "Failed to create booking",
      });
    }
  };

  // Get minimum date (tomorrow in Pacific time)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatToPacificDate(tomorrow);
  };

  // Styles
  const getInputClassName = (fieldName) => `
  w-full p-3 rounded-lg shadow-sm transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-orange-500
  bg-white dark:bg-stone-800 
  text-content-DEFAULT dark:text-white 
  placeholder:text-content-light dark:placeholder:text-stone-400
  hover:bg-gray-50 dark:hover:bg-stone-700/50
  ${
    errors[fieldName]
      ? "border-red-300 dark:border-red-600"
      : "border-border-DEFAULT dark:border-stone-700"
  }
  border
`;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-stone-800 rounded-lg shadow-lg"
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* NEW: Mobile Service Address Section */}
          {serviceType === "mobile" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="text-lg font-semibold text-content-dark dark:text-white">
                  Service Address
                </h3>
              </div>

              <AddressInput
                address={customerAddress}
                onAddressChange={onAddressChange}
                onValidateAddress={onValidateAddress}
                validationStatus={addressValidation}
              />

              {/* Address validation error */}
              {errors.root?.addressError && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.root.addressError.message}</span>
                </div>
              )}
            </div>
          )}
          {/* Customer Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-content-dark dark:text-white">
              Customer Information
            </h3>

            {/* Name Field */}
            <div className="space-y-1">
              <Controller
                name="name"
                control={control}
                rules={validationRules.name}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Full Name"
                    className={getInputClassName("name")}
                    aria-describedby="nameError"
                  />
                )}
              />
              {errors.name && (
                <span className="text-red-500 text-sm" id="nameError">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Contact Field */}
            <div className="space-y-1">
              <Controller
                name="contact"
                control={control}
                rules={validationRules.contact}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    placeholder="Contact Number (e.g., 123-456-7890)"
                    className={getInputClassName("contact")}
                    aria-describedby="contactError"
                  />
                )}
              />
              {errors.contact && (
                <span className="text-red-500 text-sm" id="contactError">
                  {errors.contact.message}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <Controller
                name="email"
                control={control}
                rules={validationRules.email}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="Email Address"
                    className={getInputClassName("email")}
                    aria-describedby="emailError"
                  />
                )}
              />
              {errors.email && (
                <span className="text-red-500 text-sm" id="emailError">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Vehicle Make/Model Field */}
            <div className="space-y-1">
              <Controller
                name="makeModel"
                control={control}
                rules={validationRules.makeModel}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Vehicle Make & Model (e.g., 2023 Honda Civic)"
                    className={getInputClassName("makeModel")}
                    aria-describedby="makeModelError"
                  />
                )}
              />
              {errors.makeModel && (
                <span className="text-red-500 text-sm" id="makeModelError">
                  {errors.makeModel.message}
                </span>
              )}
            </div>
          </div>
          {/* Appointment Scheduling Section */}
          ribbons{" "}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-content-dark dark:text-white">
              {serviceType === "mobile"
                ? "Schedule Mobile Service"
                : "Schedule Appointment"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Field */}
              <div className="space-y-1">
                <Controller
                  name="date"
                  control={control}
                  rules={validationRules.date}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={getInputClassName("date")}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) {
                          checkDateAvailability(e.target.value);
                        }
                      }}
                    >
                      <option value="">Select Date</option>
                      {generateDates().map((date) => (
                        <option
                          key={date.value}
                          value={date.value}
                          disabled={date.disabled}
                        >
                          {date.display}{" "}
                          {date.disabled ? `(${date.disabledReason})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.date && (
                  <span className="text-red-500 text-sm" id="dateError">
                    {errors.date.message}
                  </span>
                )}
              </div>

              {/* Time Field */}
              <div className="space-y-1">
                <Controller
                  name="time"
                  control={control}
                  rules={validationRules.time}
                  render={({ field }) => (
                    <div className="relative">
                      <select
                        {...field}
                        className={`${getInputClassName(
                          "time"
                        )} appearance-none cursor-pointer`}
                        disabled={!watchedDate || isCheckingAvailability}
                        aria-describedby="timeError"
                      >
                        <option value="">
                          {isCheckingAvailability
                            ? "Checking availability..."
                            : !watchedDate
                            ? "Select a date first"
                            : "Select time"}
                        </option>
                        {businessHours.map((time) => {
                          const isAvailable =
                            timeSlots[time]?.available !== false;
                          return (
                            <option
                              key={time}
                              value={time}
                              disabled={!isAvailable}
                            >
                              {time} {!isAvailable ? "(Unavailable)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-content-light dark:text-stone-400 pointer-events-none" />
                    </div>
                  )}
                />
                {errors.time && (
                  <span className="text-red-500 text-sm" id="timeError">
                    {errors.time.message}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* CAPTCHA Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-content-dark dark:text-white">
              Verification
            </h3>

            <div className="p-4 bg-background-dark dark:bg-stone-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-content-DEFAULT dark:text-white">
                  What is {captcha?.question}?
                </span>
              </div>
              <Controller
                name="captchaAnswer"
                control={control}
                rules={validationRules.captchaAnswer}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="Enter your answer"
                    className={getInputClassName("captchaAnswer")}
                    aria-describedby="captchaError"
                  />
                )}
              />
              {errors.captchaAnswer && (
                <span className="text-red-500 text-sm" id="captchaError">
                  {errors.captchaAnswer.message}
                </span>
              )}
            </div>
          </div>
          {/* Error Messages */}
          {errors.root?.serverError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-600 dark:text-red-400">
                  {errors.root.serverError.message}
                </span>
              </div>
            </div>
          )}
          {/* NEW: Mobile Service Info */}
          {serviceType === "mobile" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <MapPin className="flex-shrink-0 w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Mobile Service Information:</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside ml-4">
                    <li>50% deposit required at booking confirmation</li>
                    <li>Remaining balance due at service completion</li>
                    <li>Cancellations must be made 24+ hours in advance</li>
                    <li>Service address must be within 40 miles of Oakland</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* Form Buttons */}
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={onBack}
              className="flex-1 p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 text-content-DEFAULT dark:text-white border border-border-DEFAULT dark:border-stone-700 hover:bg-background-dark dark:hover:bg-stone-700 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Add-ons
            </motion.button>

            <motion.button
              type="submit"
              disabled={
                !isValid ||
                (serviceType === "mobile" &&
                  (!addressValidation || addressValidation.status !== "valid"))
              }
              className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                isValid &&
                (serviceType === "drive-in" ||
                  (serviceType === "mobile" &&
                    addressValidation?.status === "valid"))
                  ? "bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600"
                  : "bg-background-dark dark:bg-stone-800 text-content-light dark:text-stone-500 cursor-not-allowed"
              }`}
              whileHover={isValid ? { scale: 1.02 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
            >
              {serviceType === "mobile"
                ? "Complete Mobile Booking"
                : "Complete Booking"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingForm;
