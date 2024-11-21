import { useState, useEffect } from "react";
import { generateCaptcha } from "../utils";
import { mockBookingService } from "../services/mockBookingService";

export const useBookingState = () => {
  // Core booking state
  const [bookingStep, setBookingStep] = useState("service");
  const [activeOption, setActiveOption] = useState("drive-in");

  // Service selection state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedScent, setSelectedScent] = useState(null);

  // Form state
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    contact: "",
    makeModel: "",
    dateTime: "",
  });

  // Booking state
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Captcha state
  const [captcha, setCaptcha] = useState({ question: "", answer: "" });

  // Initialize captcha on mount
  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Option toggle handler
  const handleOptionToggle = (option) => {
    if (option !== activeOption) {
      setActiveOption(option);
      setSelectedService(null);
      setSelectedScent(null);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (bookingStep === "service" && selectedService && selectedScent) {
      setBookingStep("details");
    }
  };

  const handleBack = () => {
    if (bookingStep === "details") {
      setBookingStep("service");
    }
  };

  // Booking submission handler
  const handleBookingSubmit = async (userCaptchaAnswer) => {
    if (userCaptchaAnswer === captcha.answer) {
      setLoading(true);
      setError(null);

      try {
        // Prepare booking data
        const bookingPayload = {
          ...bookingDetails,
          serviceType: activeOption,
          serviceId: selectedService,
          scentId: selectedScent,
          timestamp: new Date().toISOString(),
        };

        console.log("Submitting booking:", bookingPayload);

        // Create booking
        const newBooking = await mockBookingService.createBooking(
          bookingPayload
        );
        console.log("Booking created:", newBooking);
        setBooking(newBooking);
        setBookingStep("confirmation"); // Make sure this is being called
        return { success: true, data: newBooking };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    } else {
      setCaptcha(generateCaptcha());
      setError("CAPTCHA verification failed. Please try again.");
      return { success: false, error: "CAPTCHA verification failed" };
    }
  };

  // Reset booking state
  const resetBookingState = () => {
    setBookingStep("service");
    setSelectedService(null);
    setSelectedScent(null);
    setBookingDetails({
      name: "",
      contact: "",
      makeModel: "",
      dateTime: "",
    });
    setBooking(null);
    setError(null);
    setCaptcha(generateCaptcha());
  };

  // Validation helpers
  const canProceedToDetails = selectedService && selectedScent;
  const isFormValid = Object.values(bookingDetails).every(Boolean);

  return {
    // State
    bookingStep,
    activeOption,
    selectedService,
    selectedScent,
    bookingDetails,
    captcha,
    booking,
    loading,
    error,

    // Setters
    setSelectedService,
    setSelectedScent,

    // Handlers
    handleOptionToggle,
    handleNext,
    handleBack,
    handleInputChange,
    handleBookingSubmit,
    resetBookingState,

    // Validation
    canProceedToDetails,
    isFormValid,
  };
};
