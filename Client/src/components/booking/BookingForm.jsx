import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  ];

  // Form validation rules
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
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
      },
    },
    makeModel: {
      required: "Car make and model is required",
      minLength: {
        value: 2,
        message: "Car make and model must be at least 2 characters long",
      },
    },
    date: {
      required: "Please select a date",
    },
    time: {
      required: "Please select a time",
    },
    captchaAnswer: {
      required: "Please answer the CAPTCHA",
      validate: value => value.trim() === captcha.answer || "Incorrect CAPTCHA answer",
    },
  };

  // Generate available dates
  const generateDates = () => {
    const dates = [];
    const current = new Date();

    for (let i = 1; i < 8; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);

      const formattedDate = date.toISOString().split("T")[0];
      const displayDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      dates.push({
        value: formattedDate,
        display: displayDate,
      });
    }
    return dates;
  };

  // Check availability for a specific date
  const checkDateAvailability = async (date) => {
    if (!date) return;
    
    setIsCheckingAvailability(true);
  
    try {
      // Format the selected date properly
            const selectedDate = new Date(date);
      selectedDate.setDate(selectedDate.getDate() + 1);
      const formattedDate = selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
  
      const response = await fetch(
        `${CONFIG.API_URL}/bookings/check-date-slots?date=${encodeURIComponent(formattedDate)}`,
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
    selectedDate.setDate(selectedDate.getDate() + 1);
    const formattedDateTime = `${selectedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    })}, ${time}`;
  
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
          value: formattedDateTime
        },
      });
  
      return true;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      setValue("time", "");
      return false;
    }
  };

  // Form submission handler
  const onFormSubmit = async (data) => {
    try {
      // Validate all fields before submission
      const isFormValid = await trigger();
      if (!isFormValid) return;
  
      // Create a new Date object from the selected date
      const selectedDate = new Date(data.date);
      selectedDate.setDate(selectedDate.getDate() + 1);
      
      // Format the date properly
      const formattedDateTime = `${selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      })}, ${data.time}`;
  
      // Check final availability with proper date
      const isSlotAvailable = await checkSlotAvailability(data.date, data.time);
      if (!isSlotAvailable) {
        setError("time", {
          type: "manual",
          message: "This time slot is no longer available"
        });
        return;
      }
  
      // Create complete booking data with proper datetime
      const bookingData = {
        ...data,
        dateTime: formattedDateTime
      };
  
      // Submit booking
      const result = await onSubmit(bookingData);
      
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to create booking');
      }
  
    } catch (error) {
      setError("root.serverError", {
        type: "manual",
        message: error.message || "Failed to create booking"
      });
    }
  };

  // Styles
  const inputClassName = `
    w-full p-3 rounded-lg shadow-sm transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-orange-500
    bg-white dark:bg-stone-800 
    text-content-DEFAULT dark:text-white 
    placeholder:text-content-light dark:placeholder:text-stone-400
    hover:bg-gray-50 dark:hover:bg-stone-700/50
    ${errors ? "border-red-500" : "border-border-DEFAULT dark:border-stone-700"}
  `;


  return (
    <div className="relative">
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-content-dark dark:text-white">
          Booking Details
        </h2>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" noValidate>
          {/* Form Level Error */}
          {errors.root?.serverError && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
              {errors.root.serverError.message}
            </div>
          )}

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
                  placeholder="Your Name"
                  className={inputClassName}
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
                  className={inputClassName}
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
                  placeholder="Email Address (Optional)"
                  className={inputClassName}
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
                  placeholder="Car Make and Model"
                  className={inputClassName}
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

          {/* Date and Time Selection */}
          <div className="flex gap-2">
            <div className="relative flex-1 space-y-1">
              <Controller
                name="date"
                control={control}
                rules={validationRules.date}
                render={({ field }) => (
                  <select 
                    {...field} 
                    className={inputClassName}
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value) {
                        checkDateAvailability(e.target.value);
                      }
                    }}
                  >
                    <option value="">Select Date</option>
                    {generateDates().map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.display}
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

            <div className="relative flex-1 space-y-1">
              <Controller
                name="time"
                control={control}
                rules={validationRules.time}
                render={({ field }) => (
                  <div>
                    <select 
                      {...field} 
                      className={`${inputClassName} ${!watchedDate ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={!watchedDate || isCheckingAvailability}
                    >
                      <option value="">
                        {isCheckingAvailability 
                          ? "Checking availability..." 
                          : !watchedDate 
                            ? "Select date first" 
                            : "Select Time"
                        }
                      </option>
                      {businessHours.map((time) => {
                        const slot = timeSlots[time];
                        const isAvailable = slot?.available;
                        const bookingInfo = slot 
                          // ? `(${slot.currentBookings}/${slot.maxBookingsPerSlot} 
                          ? "slots taken"
                          : '';
                        
                        return (
                          <option 
                            key={time} 
                            value={time}
                            disabled={!isAvailable}
                          >
                            {time} {!isAvailable ? bookingInfo : ""}
                          </option>
                        );
                      })}
                    </select>
                    {isCheckingAvailability && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-light border-t-transparent"></div>
                      </div>
                    )}
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

          {/* CAPTCHA */}
          <div className="p-4 rounded-lg border-2 border-border-DEFAULT dark:border-stone-700 bg-background-DEFAULT dark:bg-stone-800">
            <label className="block mb-2 font-medium text-content-dark dark:text-white">
              {captcha.question}
            </label>
            <Controller
              name="captchaAnswer"
              control={control}
              rules={validationRules.captchaAnswer}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter CAPTCHA answer"
                  className={inputClassName}
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

          {/* Form Actions */}
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-stone-900/95 backdrop-blur-sm border-t border-border-light dark:border-stone-700">
            <div className="max-w-[1000px] mx-auto space-y-3">
              <motion.button
                type="submit"
                disabled={!isValid}
                className={`w-full p-3 rounded-lg transition-colors duration-200 ${
                  isValid
                    ? "bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600"
                    : "bg-background-dark dark:bg-stone-800 text-content-light dark:text-stone-500 cursor-not-allowed"
                }`}
                whileHover={isValid ? { scale: 1.02 } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
              >
                Complete Booking
              </motion.button>

              <motion.button
                type="button"
                onClick={onBack}
                className="w-full p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 text-content-DEFAULT dark:text-white border border-border-DEFAULT dark:border-stone-700 hover:bg-background-dark dark:hover:bg-stone-700 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Addons
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
              }
export default BookingForm;