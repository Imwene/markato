// useBookingState.js
import { useState, useEffect } from "react";
import { generateCaptcha } from "../utils";
import { useServices } from "./useServices";
import { scents, optionalServicesData, vehicleTypes } from "../constants";

export const useBookingState = () => {
  // Core booking state
  const { services } = useServices();
  const [selectedVehicleType, setSelectedVehicleType] = useState("sedan");
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
  const handleOptionSelect = (options) => {
    console.log('Setting options:', options); // Debug log
    setSelectedOptions(options);
  };

  // Booking submission handler
  // const handleBookingSubmit = async (userCaptchaAnswer) => {
  //   if (userCaptchaAnswer === captcha.answer) {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const selectedServiceDetails = services.find(
  //         (s) => s.id === selectedService
  //       );

  //       const selectedScentName =
  //         scents.find((s) => s.id === selectedScent)?.name || "None";

  //       const formattedOptionalServices = selectedOptions.map((optionId) => {
  //         const optionDetails = optionalServicesData.find(
  //           (service) => service.id === optionId
  //         );
  //         return {
  //           serviceId: optionDetails.id,
  //           name: optionDetails.name,
  //           price: parseFloat(optionDetails.price),
  //         };
  //       });

  //       const servicePrice =
  //         selectedServiceDetails.vehiclePricing[selectedVehicleType];
  //       const optionalServicesTotal = formattedOptionalServices.reduce(
  //         (sum, service) => sum + service.price,
  //         0
  //       );

  //       const totalPrice = servicePrice + optionalServicesTotal;

  //       const date = new Date();
  //       const dateStr =
  //         date.getFullYear().toString() +
  //         (date.getMonth() + 1).toString().padStart(2, "0") +
  //         date.getDate().toString().padStart(2, "0");
  //       const random = Math.floor(Math.random() * 10000)
  //         .toString()
  //         .padStart(4, "0");
  //       const confirmationNumber = `BK-${dateStr}-${random}`;

  //       const bookingPayload = {
  //         name: bookingDetails.name,
  //         contact: bookingDetails.contact,
  //         vehicleType: selectedVehicleType,
  //         makeModel: bookingDetails.makeModel,
  //         dateTime: bookingDetails.dateTime,
  //         serviceId: selectedService,
  //         serviceName: selectedServiceDetails?.name,
  //         selectedScent: selectedScentName,
  //         servicePrice: servicePrice,
  //         features: selectedServiceDetails.features,
  //         optionalServices: formattedOptionalServices,
  //         totalPrice: totalPrice,
  //         confirmationNumber: confirmationNumber,
  //       };

  //       const response = await fetch("http://localhost:8080/api/bookings", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(bookingPayload),
  //       });

  //       const data = await response.json();

  //       if (data.success) {
  //         setBooking(bookingPayload);
  //         setBookingStep("confirmation");
  //         return { success: true, booking: bookingPayload };
  //       }
  //     } catch (err) {
  //       setError(err.message);
  //       return { success: false, error: err.message };
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else {
  //     setCaptcha(generateCaptcha());
  //     setError("CAPTCHA verification failed. Please try again.");
  //     return { success: false, error: "CAPTCHA verification failed" };
  //   }
  // };

  // In handleBookingSubmit
// const handleBookingSubmit = async (userCaptchaAnswer) => {
//   console.log('Starting booking submission:', {
//     userCaptchaAnswer,
//     captchaAnswer: captcha.answer,
//     selectedService,
//     services,  // Log all services to see their ID structure
//     selectedServiceDetails: services.find(s => s._id === selectedService || s.id === selectedService)
//   });

//   if (userCaptchaAnswer === captcha.answer) {
//     setLoading(true);
//     setError(null);

//     try {
//       // Updated service finding logic
//       const selectedServiceDetails = services.find(
//         (s) => s._id === selectedService || s.id === selectedService
//       );

//       console.log('Service details found:', { selectedServiceDetails });

//       const selectedScentName =
//         scents.find((s) => s.id === selectedScent)?.name || "None";

//       const formattedOptionalServices = selectedOptions.map((optionId) => {
//         const optionDetails = optionalServicesData.find(
//           (service) => service.id.toString() === optionId.toString()
//         );
//         return {
//           serviceId: optionDetails.id,
//           name: optionDetails.name,
//           price: parseFloat(optionDetails.price),
//         };
//       });

//       console.log('Formatted data:', {
//         selectedScentName,
//         formattedOptionalServices,
//         vehicleType: selectedVehicleType
//       });

//       const servicePrice =
//         selectedServiceDetails.vehiclePricing[selectedVehicleType];
//       const optionalServicesTotal = formattedOptionalServices.reduce(
//         (sum, service) => sum + service.price,
//         0
//       );

//       const totalPrice = servicePrice + optionalServicesTotal;

//       const bookingPayload = {
//         name: bookingDetails.name,
//         contact: bookingDetails.contact,
//         vehicleType: selectedVehicleType,
//         makeModel: bookingDetails.makeModel,
//         dateTime: bookingDetails.dateTime,
//         serviceId: selectedService,
//         serviceName: selectedServiceDetails?.name,
//         selectedScent: selectedScentName,
//         servicePrice: servicePrice,
//         features: selectedServiceDetails.features,
//         optionalServices: formattedOptionalServices,
//         totalPrice: totalPrice,
//         confirmationNumber: confirmationNumber,
//       };

//       console.log('Final payload:', bookingPayload);

//       const response = await fetch("http://localhost:8080/api/bookings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(bookingPayload),
//       });

//       const data = await response.json();
//       console.log('Server response:', data);

//       if (data.success) {
//         setBooking(bookingPayload);
//         setBookingStep("confirmation");
//         return { success: true, booking: bookingPayload };
//       }
//     } catch (err) {
//       console.error('Booking error:', err);
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   } else {
//     console.log('CAPTCHA mismatch:', {
//       provided: userCaptchaAnswer,
//       expected: captcha.answer
//     });
//     setCaptcha(generateCaptcha());
//     setError("CAPTCHA verification failed. Please try again.");
//     return { success: false, error: "CAPTCHA verification failed" };
//   }
// };

const handleBookingSubmit = async (userCaptchaAnswer) => {
  if (userCaptchaAnswer === captcha.answer) {
    setLoading(true);
    setError(null);

    try {
      const selectedServiceDetails = services.find(
        (s) => s._id === selectedService || s.id === selectedService
      );

      const selectedScentName =
        scents.find((s) => s.id === selectedScent)?.name || "None";

      const formattedOptionalServices = selectedOptions.map((optionId) => {
        const optionDetails = optionalServicesData.find(
          (service) => service.id.toString() === optionId.toString()
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

      // Generate confirmation number
      const date = new Date();
      const dateStr =
        date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, "0") +
        date.getDate().toString().padStart(2, "0");
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
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
        selectedScent: selectedScentName,
        servicePrice: servicePrice,
        features: selectedServiceDetails.features,
        optionalServices: formattedOptionalServices,
        totalPrice: totalPrice,
        confirmationNumber: confirmationNumber,
        status: 'pending' // Add initial status
      };

      const response = await fetch("http://localhost:8080/api/bookings", {
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
    optionalServicesData: optionalServicesData.map(service => ({
      ...service,
      id: service.id.toString() // Ensure IDs are strings for consistency
    })),

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