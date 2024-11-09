import { useState, useEffect } from "react";
import { generateCaptcha } from "../utils";

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
  const handleBookingSubmit = (userCaptchaAnswer) => {
    if (userCaptchaAnswer === captcha.answer) {
      const bookingPayload = {
        ...bookingDetails,
        serviceType: activeOption,
        serviceId: selectedService,
        scentId: selectedScent,
        timestamp: new Date().toISOString(),
      };

      console.log("Booking submitted:", bookingPayload);
      setBookingStep("confirmation");
      return { success: true, data: bookingPayload };
    } else {
      setCaptcha(generateCaptcha());
      return {
        success: false,
        error: "CAPTCHA verification failed. Please try again.",
      };
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
