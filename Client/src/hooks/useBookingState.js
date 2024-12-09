import { useState, useEffect } from "react";
import { generateCaptcha } from "../utils";
import { mockBookingService } from "../services/mockBookingService";
import { services, scents, optionalServicesData } from "../constants";



export const useBookingState = () => {
  // Core booking state
  const [selectedOptions, setSelectedOptions] = useState([]);
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
    switch (bookingStep) {
      case "service":
        setBookingStep("options");
        break;
      case "options":
        setBookingStep("details");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (bookingStep) {
      case "options":
        setBookingStep("service");
        break;
      case "details":
        setBookingStep("options");
        break;
      default:
        break;
    }
  };

  //handleOptionSelect
  const handleOptionSelect = (options) => {
    setSelectedOptions(options);
  };

  // Booking submission handler
  const handleBookingSubmit = async (userCaptchaAnswer) => {
    if (userCaptchaAnswer === captcha.answer) {
      setLoading(true);
      setError(null);

      try {
        // Get the selected service details
        const selectedServiceDetails = services[activeOption].find(
          (s) => s.id === selectedService
        );

        const selectedScentName =
          scents.find((s) => s.id === selectedScent)?.name || "Unknown Scent";

        // Format optional services data
        const formattedOptionalServices = selectedOptions.map((optionId) => {
          // Find the option details from optional services array
          const optionDetails = optionalServicesData.find(
            (service) => service.id === optionId
          );
          return {
            serviceId: optionDetails.id,
            name: optionDetails.name,
            price: parseFloat(optionDetails.price),
          };
        });

        // Generate confirmation number
        const date = new Date();
        const dateStr =
          date.getFullYear().toString() +
          (date.getMonth() + 1).toString().padStart(2, "0") +
          date.getDate().toString().padStart(2, "0");
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        const confirmationNumber = `BK-${dateStr}-${random}`;

        // Create booking payload
        const bookingPayload = {
          name: bookingDetails.name,
          contact: bookingDetails.contact,
          makeModel: bookingDetails.makeModel,
          dateTime: bookingDetails.dateTime,
          serviceType: activeOption,
          serviceId: selectedService,
          serviceName: selectedServiceDetails?.name,
          selectedScent: selectedScentName,
          servicePrice: parseFloat(selectedServiceDetails.price),
          serviceDescription: selectedServiceDetails?.description,
          optionalServices: formattedOptionalServices,
          confirmationNumber: confirmationNumber,
        };

        const response = await fetch("http://localhost:8080/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingPayload),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to create booking");
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to create booking");
        }

        // Create booking
        setBooking(data.data);
        setBookingStep("confirmation");
        return { success: true, data: data.data };
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
    selectedOptions,
    bookingDetails,
    captcha,
    booking,
    loading,
    error,
    optionalServicesData,

    // Setters
    setSelectedService,
    setSelectedScent,
    setSelectedOptions,

    // Handlers
    handleOptionToggle,
    handleOptionSelect,
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
