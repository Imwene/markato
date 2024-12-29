// useBookingState.js
import { useState, useEffect } from "react";
import { generateCaptcha } from "../utils";
import { useServices } from "./useServices";
import { useConfig } from "./useConfig";
import { CONFIG } from "../config/config";
//import { scents, optionalServicesData, vehicleTypes } from "../constants";

export const useBookingState = () => {
  // Core booking state
  const { services } = useServices();
  const { vehicleTypes, scents, optionalServices} = useConfig();
  const [selectedVehicleType, setSelectedVehicleType] = useState(vehicleTypes[0]?.id || "sedan");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [bookingStep, setBookingStep] = useState("service");

  // Service selection state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedScent, setSelectedScent] = useState(null);

  // Form state
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    contact: "",
    email:"",
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

  // Reset optional services when changing service or vehicle type
  useEffect(() => {
    setSelectedOptions([]);
  }, [selectedService, selectedVehicleType]);

  // Vehicle type handler
  const handleVehicleTypeChange = (vehicleType) => {
    setSelectedVehicleType(vehicleType);
    setSelectedService(null);
    setSelectedScent(null);
  };

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    switch (bookingStep) {
      case "service":
        if (canProceedToDetails) {
          setBookingStep("options");
        }
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

  // Optional services handler - updated to handle single option toggle
// Optional services handler
const handleOptionSelect = (options) => {
  setSelectedOptions(options);
};


// Booking submission handler
const handleBookingSubmit = async (userCaptchaAnswer) => {
  if (userCaptchaAnswer === captcha.answer) {
    setLoading(true);
    setError(null);

    try {
      const selectedServiceDetails = services.find(
        (s) => s._id === selectedService || s.id === selectedService
      );

      const selectedScentDetails = scents.find(s => s.id === selectedScent);
      const selectedScentName = selectedScentDetails?.name || "None";

      const formattedOptionalServices = selectedOptions.map((optionId) => {
        const optionDetails = optionalServices.find(
          service => service.id.toString() === optionId.toString()
        );
        return {
          serviceId: optionDetails.id,
          name: optionDetails.name,
          price: parseFloat(optionDetails.price),
        };
      });


      const servicePrice =
        selectedServiceDetails.vehiclePricing[selectedVehicleType];
      const optionalServicesTotal = formattedOptionalServices.reduce(
        (sum, service) => sum + service.price,
        0
      );

      const totalPrice = servicePrice + optionalServicesTotal;

      const date = new Date();
      const dateStr =
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0") +
      date.getFullYear().toString() ;
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const confirmationNumber = `BK-${dateStr}-${random}`;

      const bookingPayload = {
        name: bookingDetails.name,
        contact: bookingDetails.contact,
        email: bookingDetails.email || null,
        vehicleType: selectedVehicleType,
        makeModel: bookingDetails.makeModel,
        dateTime: bookingDetails.dateTime,
        serviceId: selectedService,
        serviceName: selectedServiceDetails?.name,
        selectedScent: selectedScentName || "None",
        servicePrice: servicePrice,
        features: selectedServiceDetails.features,
        optionalServices: formattedOptionalServices,
        totalPrice: totalPrice,
        confirmationNumber: confirmationNumber,
        status: 'pending'
      };

      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.BOOKINGS.BASE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(bookingPayload);
        setBookingStep("confirmation");
        return { success: true, booking: bookingPayload };
      } else {
        throw new Error(data.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
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
    setSelectedOptions([]);
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
    selectedVehicleType,
    selectedService,
    selectedScent,
    selectedOptions,
    bookingDetails,
    captcha,
    booking,
    loading,
    error,
    optionalServices,
    vehicleTypes,
    scents,

    // Setters
    setSelectedService,
    setSelectedScent,
    setSelectedOptions,

    // Handlers
    handleVehicleTypeChange,
    handleBack,
    handleOptionSelect,
    handleNext,
    handleInputChange,
    handleBookingSubmit,
    resetBookingState,

    // Validation
    canProceedToDetails,
    isFormValid,
  };
};