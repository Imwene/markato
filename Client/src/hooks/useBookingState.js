// useBookingState.js
import { useState, useEffect } from "react";
import { generateCaptcha } from "../utils";
import { useServices } from "./useServices";
import { useConfig } from "./useConfig";
import { CONFIG } from "../config/config";

export const useBookingState = () => {
  // Core booking state
  const { services } = useServices();
  const { vehicleTypes, scents, optionalServices } = useConfig();
  const [selectedVehicleType, setSelectedVehicleType] = useState(
    vehicleTypes[0]?.id || "sedan"
  );
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [optionQuantities, setOptionQuantities] = useState({});
  const [bookingStep, setBookingStep] = useState("service-type"); // NEW: Start with service type selection
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // NEW: Mobile Service State
  const [serviceType, setServiceType] = useState("drive-in");
  const [customerAddress, setCustomerAddress] = useState("");
  const [addressValidation, setAddressValidation] = useState(null);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);

  // Service selection state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedScent, setSelectedScent] = useState(null);

  // Form state
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    contact: "",
    email: "",
    makeModel: "",
    dateTime: "",
  });

  // Booking state
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NEW: Mobile payment step support
  const [pendingBookingPayload, setPendingBookingPayload] = useState(null);
  const [mobileDetails, setMobileDetails] = useState({
    parkingType: "driveway",
    hasWater: false,
    hasPower: false,
    accessNotes: "",
    arriveContactMethod: "call",
    depositToken: null,
  });

  // Captcha state
  const [captcha, setCaptcha] = useState({ question: "", answer: "" });

  // Initialize captcha on mount
  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  // Reset optional services when changing service or vehicle type
  useEffect(() => {
    setSelectedOptions([]);
    setOptionQuantities({});
  }, [selectedService, selectedVehicleType]);

  // Reset address validation when service type changes
  useEffect(() => {
    if (serviceType === "drive-in") {
      setCustomerAddress("");
      setAddressValidation(null);
    }
  }, [serviceType]);

  // NEW: Service Type Handler
  const handleServiceTypeChange = (newServiceType) => {
    setServiceType(newServiceType);
    // Reset service selection when changing service type
    setSelectedService(null);
    setSelectedScent(null);
  };

  // NEW: Address Validation Handler
  const handleAddressChange = (address) => {
    setCustomerAddress(address);
    // Reset validation when address changes
    if (addressValidation && addressValidation.address !== address) {
      setAddressValidation(null);
    }
  };

  // NEW: Address Validation Function
  const validateAddress = async (address) => {
    if (!address || address.trim().length < 10) {
      setAddressValidation(null);
      return;
    }

    setIsValidatingAddress(true);
    try {
      const response = await fetch(
        `${CONFIG.API_URL}${CONFIG.ENDPOINTS.BOOKINGS.VALIDATE_ADDRESS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: address.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAddressValidation({
          status: data.isValid ? "valid" : "outside_service_area",
          address: address,
          distance: data.distance,
          coordinates: data.coordinates,
          formattedAddress: data.formattedAddress,
          addressComponents: data.addressComponents,
          message: data.isValid
            ? "Address validated successfully"
            : `Address is outside our ${data.serviceRadius}-mile service area`,
        });
      } else {
        setAddressValidation({
          status: "invalid",
          address: address,
          message: data.error || "Address validation failed",
        });
      }
    } catch (error) {
      console.error("Address validation error:", error);
      setAddressValidation({
        status: "invalid",
        address: address,
        message:
          "Unable to validate address. Please check your connection and try again.",
      });
    } finally {
      setIsValidatingAddress(false);
    }
  };

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

  // NEW: Updated Navigation Handlers with Service Type Step
  const handleNext = () => {
    switch (bookingStep) {
      case "service-type":
        // Validate service type selection and address if mobile
        if (
          serviceType === "mobile" &&
          (!addressValidation || addressValidation.status !== "valid")
        ) {
          return; // Can't proceed without valid address for mobile service
        }
        setBookingStep("service");
        break;
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
      case "service":
        setBookingStep("service-type");
        break;
      case "options":
        setBookingStep("service");
        break;
      case "details":
        setBookingStep("options");
        break;
      case "payment":
        setBookingStep("details");
        break;
      default:
        break;
    }
  };

  // Optional services handlers
  const handleOptionSelect = (options) => {
    setSelectedOptions(options);
    // Keep quantities only for still-selected options
    setOptionQuantities((prev) => {
      const next = {};
      options.forEach((id) => {
        if (prev[id]) next[id] = prev[id];
      });
      return next;
    });
  };

  const handleOptionQuantityChange = (optionId, quantity) => {
    const q = Math.max(1, Math.min(4, Number(quantity) || 1));
    setOptionQuantities((prev) => ({ ...prev, [optionId]: q }));
  };

  // NEW: Updated Price Calculation with Mobile Upcharge
  const calculateTotalPrice = () => {
    if (!selectedService) return 0;

    const selectedServiceDetails = services.find(
      (s) => s._id === selectedService || s.id === selectedService
    );

    if (!selectedServiceDetails) return 0;

    let servicePrice =
      selectedServiceDetails.vehiclePricing[selectedVehicleType];

    // Add mobile service upcharge
    if (serviceType === "mobile") {
      servicePrice += CONFIG.MOBILE_SERVICE.UPCHARGE;
    }

    const optionalServicesTotal = selectedOptions.reduce((sum, optionId) => {
      const optionDetails = optionalServices.find(
        (service) => service.id.toString() === optionId.toString()
      );
      return sum + (optionDetails ? parseFloat(optionDetails.price) : 0);
    }, 0);

    return servicePrice + optionalServicesTotal;
  };

  // NEW: Calculate base service price (without mobile upcharge or optional services)
  const calculateBaseServicePrice = () => {
    if (!selectedService) return 0;

    const selectedServiceDetails = services.find(
      (s) => s._id === selectedService || s.id === selectedService
    );

    if (!selectedServiceDetails) return 0;

    // Return just the base service price - mobile upcharge handled in display
    return selectedServiceDetails.vehiclePricing[selectedVehicleType];
  };

  // NEW: Updated Form Validation
  const validateBookingData = (formData) => {
    const errors = {};

    // Basic form validations
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.contact?.trim()) errors.contact = "Contact is required";
    if (!formData.makeModel?.trim())
      errors.makeModel = "Vehicle make/model is required";
    if (!formData.dateTime?.trim())
      errors.dateTime = "Date and time is required";

    // Service selection validations
    if (!selectedService) errors.service = "Service selection is required";
    if (!selectedScent) errors.scent = "Scent selection is required";

    // NEW: Mobile service validations
    if (serviceType === "mobile") {
      if (!customerAddress?.trim()) {
        errors.address = "Address is required for mobile service";
      } else if (!addressValidation || addressValidation.status !== "valid") {
        errors.address =
          "Please provide a valid address within our service area";
      }
    }

    // Email validation (if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Phone validation (basic)
    if (formData.contact && formData.contact.trim()) {
      const phoneRegex = /^[\d\s\-\(\)\+\.]{10,}$/;
      if (!phoneRegex.test(formData.contact.trim())) {
        errors.contact = "Please enter a valid phone number";
      }
    }

    return errors;
  };

  // NEW: Updated Booking Submission Handler
  const handleBookingSubmit = async (formData) => {
    if (formData.captchaAnswer === captcha.answer) {
      setLoading(true);
      setError(null);

      try {
        // Validate form data
        const validationErrors = validateBookingData(formData);
        if (Object.keys(validationErrors).length > 0) {
          throw new Error(
            "Validation failed: " + Object.values(validationErrors).join(", ")
          );
        }

        // Check slot availability
        const availabilityResponse = await fetch(
          `${CONFIG.API_URL}/bookings/check-slot?dateTime=${encodeURIComponent(
            formData.dateTime
          )}`
        );
        const availabilityData = await availabilityResponse.json();

        if (!availabilityData.available) {
          throw new Error(
            "This time slot is no longer available. Please select another time."
          );
        }

        const selectedServiceDetails = services.find(
          (s) => s._id === selectedService || s.id === selectedService
        );

        const selectedScentDetails = scents.find((s) => s.id === selectedScent);
        const selectedScentName = selectedScentDetails?.name || "None";

        const formattedOptionalServices = selectedOptions.map((optionId) => {
          const optionDetails = optionalServices.find(
            (service) => service.id.toString() === optionId.toString()
          );
          const basePrice = parseFloat(optionDetails.price);
          let name = optionDetails.name;
          let price = basePrice;

          if (name?.toLowerCase() === "seat cloth shampoo") {
            const q = Math.max(
              1,
              Math.min(4, optionQuantities?.[optionId] || 1)
            );
            price = basePrice * q;
            name = `${name} (x${q} seat${q > 1 ? "s" : ""})`;
          }

          return {
            serviceId: optionDetails.id,
            name,
            price,
          };
        });

        let servicePrice =
          selectedServiceDetails.vehiclePricing[selectedVehicleType];

        // Add mobile service upcharge to service price
        if (serviceType === "mobile") {
          servicePrice += CONFIG.MOBILE_SERVICE.UPCHARGE;
        }

        const optionalServicesTotal = formattedOptionalServices.reduce(
          (sum, service) => sum + service.price,
          0
        );

        const totalPrice = servicePrice + optionalServicesTotal;

        // NEW: Build booking payload with mobile service fields
        const bookingPayload = {
          name: formData.name,
          contact: formData.contact,
          email: formData.email,
          vehicleType: selectedVehicleType,
          makeModel: formData.makeModel,
          dateTime: formData.dateTime,
          serviceId: selectedService,
          serviceName: selectedServiceDetails.name,
          selectedScent: selectedScentName,
          servicePrice:
            selectedServiceDetails.vehiclePricing[selectedVehicleType], // Base price without mobile upcharge
          optionalServices: formattedOptionalServices,
          totalPrice: totalPrice,
          // NEW: Mobile service fields
          serviceType: serviceType,
          ...(serviceType === "mobile" &&
            addressValidation?.status === "valid" && {
              customerAddress: {
                street: addressValidation.addressComponents?.street || "",
                city: addressValidation.addressComponents?.city || "",
                state: addressValidation.addressComponents?.state || "",
                zipCode: addressValidation.addressComponents?.zipCode || "",
                coordinates: addressValidation.coordinates,
              },
              mobileDetails: {
                parkingType: mobileDetails.parkingType,
                hasWater: mobileDetails.hasWater,
                hasPower: mobileDetails.hasPower,
                accessNotes: mobileDetails.accessNotes,
                arriveContactMethod: mobileDetails.arriveContactMethod,
              },
            }),
        };

        // If mobile service, go to payment step instead of submitting immediately
        if (serviceType === "mobile") {
          setPendingBookingPayload(bookingPayload);
          setBookingStep("payment");
          return; // Do not submit yet
        }

        // Submit booking for drive-in
        const response = await fetch(`${CONFIG.API_URL}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create booking");
        }

        const result = await response.json();
        setBooking(result.data);
        setBookingStep("confirmation");
      } catch (error) {
        console.error("Booking submission error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Incorrect captcha answer. Please try again.");
      setCaptcha(generateCaptcha());
    }
  };

  // Reset booking state
  const resetBookingState = () => {
    setBookingStep("service-type");
    setSelectedService(null);
    setSelectedScent(null);
    setSelectedOptions([]);
    setOptionQuantities({});
    setBookingDetails({
      name: "",
      contact: "",
      email: "",
      makeModel: "",
      dateTime: "",
    });
    setBooking(null);
    setError(null);
    setCaptcha(generateCaptcha());
  };

  // Progress calculation - updated for new step
  const getProgress = () => {
    const steps = serviceType === "mobile" 
      ? ["service-type", "service", "options", "details", "payment"] 
      : ["service-type", "service", "options", "details"];
    const currentIndex = steps.indexOf(bookingStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };
  const canProceedToDetails = selectedService && selectedScent;
  const canProceedFromServiceType =
    serviceType === "drive-in" ||
    (serviceType === "mobile" && addressValidation?.status === "valid");

  // NEW: Finalize mobile booking after payment tokenization
  const finalizeMobileBooking = async ({ depositToken, fields }) => {
    if (!pendingBookingPayload) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...pendingBookingPayload,
        depositToken,
        ...(fields && { mobileDetails: { ...pendingBookingPayload.mobileDetails, ...fields } }),
      };

      const response = await fetch(`${CONFIG.API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }
      const result = await response.json();
      setBooking(result.data);
      setPendingBookingPayload(null);
      setBookingStep("confirmation");
    } catch (err) {
      console.error("Mobile booking finalize error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Existing state
    selectedVehicleType,
    selectedOptions,
    bookingStep,
    selectedService,
    selectedScent,
    selectedOptions,
    optionQuantities,
    bookingDetails,
    booking,
    loading,
    error,
    captcha,
    isCaptchaValid,
    services,
    vehicleTypes,
    scents,
    optionalServices,

    // NEW: Mobile service state
    serviceType,
    customerAddress,
    addressValidation,
    isValidatingAddress,

    // Existing handlers (maintaining compatibility)
    setSelectedVehicleType: handleVehicleTypeChange,
    setSelectedService,
    setSelectedScent,
    handleOptionSelect,
    handleOptionQuantityChange,
    setBookingStep,
    setIsCaptchaValid,
    handleInputChange,
    handleNext,
    handleBack,
    handleBookingSubmit,
    handleVehicleTypeChange, // Add this for compatibility

    // NEW: Mobile service handlers
    handleServiceTypeChange,
    handleAddressChange,
    validateAddress,

    // Payment step helpers
    finalizeMobileBooking,
    mobileDetails,
    setMobileDetails,

    // Computed values
    canProceedToDetails,
    canProceedFromServiceType,
    totalPrice: calculateTotalPrice(),
    baseServicePrice: calculateBaseServicePrice(),
    progress: getProgress(),
  };
};
