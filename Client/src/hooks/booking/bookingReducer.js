import { useReducer, useEffect, useRef, useCallback } from "react";
import { generateCaptcha } from "../../utils";
import { useServices } from "../useServices";
import { useConfig } from "../useConfig";
import { CONFIG } from "../../config/config";

export const initialState = {
  // Core Selection
  serviceType: "drive-in",
  selectedVehicleType: "sedan",
  selectedService: null,
  selectedScent: null,
  selectedOptions: [],
  optionQuantities: {},

  // Navigation
  bookingStep: "service-type",

  // User Input
  bookingDetails: {
    name: "",
    contact: "",
    email: "",
    makeModel: "",
    dateTime: "",
  },
  mobileDetails: {
    parkingType: "driveway",
    hasWater: false,
    hasPower: false,
    accessNotes: "",
    arriveContactMethod: "call",
    depositToken: null,
  },

  // Address & Validation
  customerAddress: "",
  addressValidation: null,
  isValidatingAddress: false,

  // Submission State
  booking: null,
  loading: false,
  error: null,
  pendingBookingPayload: null,

  // Captcha
  captcha: { question: "", answer: "" },
  isCaptchaValid: false,
};

export const bookingReducer = (state, action) => {
  switch (action.type) {
    case "SET_SERVICE_TYPE":
      return {
        ...state,
        serviceType: action.payload,
        // Reset dependent fields
        selectedService: null,
        selectedScent: null,
        customerAddress:
          action.payload === "drive-in" ? "" : state.customerAddress,
        addressValidation:
          action.payload === "drive-in" ? null : state.addressValidation,
      };

    case "SET_VEHICLE_TYPE":
      return {
        ...state,
        selectedVehicleType: action.payload,
        selectedService: null,
        selectedScent: null,
        selectedOptions: [],
        optionQuantities: {},
      };

    case "SET_SERVICE":
      return {
        ...state,
        selectedService: action.payload,
        selectedOptions: [], // Reset options when service changes
        optionQuantities: {},
      };

    case "SET_SCENT":
      return {
        ...state,
        selectedScent: action.payload,
      };

    case "SET_OPTIONS": {
      // Filter quantities to only keep those for selected options
      const nextQuantities = {};
      action.payload.forEach((id) => {
        if (state.optionQuantities[id]) {
          nextQuantities[id] = state.optionQuantities[id];
        }
      });
      return {
        ...state,
        selectedOptions: action.payload,
        optionQuantities: nextQuantities,
      };
    }

    case "SET_OPTION_QUANTITY":
      return {
        ...state,
        optionQuantities: {
          ...state.optionQuantities,
          [action.payload.id]: action.payload.quantity,
        },
      };

    case "SET_BOOKING_STEP":
      return {
        ...state,
        bookingStep: action.payload,
      };

    case "UPDATE_DETAILS":
      return {
        ...state,
        bookingDetails: {
          ...state.bookingDetails,
          [action.payload.name]: action.payload.value,
        },
      };

    case "UPDATE_MOBILE_DETAILS":
      return {
        ...state,
        mobileDetails: {
          ...state.mobileDetails,
          ...action.payload,
        },
      };

    case "SET_ADDRESS":
      return {
        ...state,
        customerAddress: action.payload,
        // Reset validation if address changed significantly
        addressValidation:
          state.addressValidation?.address !== action.payload
            ? null
            : state.addressValidation,
      };

    case "SET_ADDRESS_VALIDATION":
      return {
        ...state,
        addressValidation: action.payload,
        isValidatingAddress: false,
      };

    case "SET_VALIDATING_ADDRESS":
      return {
        ...state,
        isValidatingAddress: action.payload,
      };

    case "SET_CAPTCHA":
      return {
        ...state,
        captcha: action.payload,
      };

    case "SET_CAPTCHA_VALID":
      return {
        ...state,
        isCaptchaValid: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "SET_BOOKING_SUCCESS":
      return {
        ...state,
        booking: action.payload,
        bookingStep: "confirmation",
        loading: false,
        error: null,
      };

    case "SET_PENDING_PAYLOAD":
      return {
        ...state,
        pendingBookingPayload: action.payload,
        bookingStep: "payment",
      };

    case "RESET":
      return {
        ...initialState,
        captcha: action.payload?.captcha || initialState.captcha,
        selectedVehicleType: action.payload?.vehicleType || "sedan",
      };

    default:
      return state;
  }
};

export const useBookingState = () => {
  // Core booking state managed by reducer
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // External data hooks
  const { services } = useServices();
  const { vehicleTypes, scents, optionalServices } = useConfig();

  // AbortController ref for address validation
  const addressValidationAbortRef = useRef(null);

  // Initialize captcha on mount and cleanup abort controller
  useEffect(() => {
    dispatch({ type: "SET_CAPTCHA", payload: generateCaptcha() });
    return () => {
      if (addressValidationAbortRef.current) {
        addressValidationAbortRef.current.abort();
      }
    };
  }, []);

  // -- Handlers --

  const handleServiceTypeChange = (newServiceType) => {
    dispatch({ type: "SET_SERVICE_TYPE", payload: newServiceType });
  };

  const handleVehicleTypeChange = (vehicleType) => {
    dispatch({ type: "SET_VEHICLE_TYPE", payload: vehicleType });
  };

  const setSelectedService = (serviceId) => {
    dispatch({ type: "SET_SERVICE", payload: serviceId });
  };

  const setSelectedScent = (scentId) => {
    dispatch({ type: "SET_SCENT", payload: scentId });
  };

  const setBookingStep = (step) => {
    dispatch({ type: "SET_BOOKING_STEP", payload: step });
  };

  const setIsCaptchaValid = (isValid) => {
    dispatch({ type: "SET_CAPTCHA_VALID", payload: isValid });
  };

  // Address Validation
  const handleAddressChange = (address) => {
    dispatch({ type: "SET_ADDRESS", payload: address });
  };

  const validateAddress = useCallback(async (address) => {
    if (!address || address.trim().length < 10) {
      dispatch({ type: "SET_ADDRESS_VALIDATION", payload: null });
      return;
    }

    // Cancel any previous in-flight validation request
    if (addressValidationAbortRef.current) {
      addressValidationAbortRef.current.abort();
    }
    addressValidationAbortRef.current = new AbortController();

    dispatch({ type: "SET_VALIDATING_ADDRESS", payload: true });
    try {
      const response = await fetch(
        `${CONFIG.API_URL}${CONFIG.ENDPOINTS.BOOKINGS.VALIDATE_ADDRESS}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: address.trim() }),
          signal: addressValidationAbortRef.current.signal,
        }
      );

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: "SET_ADDRESS_VALIDATION",
          payload: {
            status:
              data.status || (data.isValid ? "valid" : "outside_service_area"),
            address: address,
            distance: data.distance,
            coordinates: data.coordinates,
            formattedAddress: data.formattedAddress,
            addressComponents: data.addressComponents,
            message:
              data.message ||
              (data.isValid
                ? "Address validated successfully"
                : `Address is outside our ${data.serviceRadius}-mile East Bay service area`),
          },
        });
      } else {
        dispatch({
          type: "SET_ADDRESS_VALIDATION",
          payload: {
            status: "invalid",
            address: address,
            message: data.error || "Address validation failed",
          },
        });
      }
    } catch (error) {
      // Ignore abort errors - they're expected when cancelling previous requests
      if (error.name === 'AbortError') return;
      console.error("Address validation error:", error);
      dispatch({
        type: "SET_ADDRESS_VALIDATION",
        payload: {
          status: "invalid",
          address: address,
          message:
            "Unable to validate address. Please check your connection and try again.",
        },
      });
    } finally {
      dispatch({ type: "SET_VALIDATING_ADDRESS", payload: false });
    }
  }, []);

  // Form Handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_DETAILS", payload: { name, value } });
  };

  const setMobileDetails = (details) => {
    // Handle both function update or direct object
    const newDetails =
      typeof details === "function" ? details(state.mobileDetails) : details;
    dispatch({ type: "UPDATE_MOBILE_DETAILS", payload: newDetails });
  };

  // Navigation Logic
  const canProceedToDetails = state.selectedService && state.selectedScent;
  const canProceedFromServiceType =
    state.serviceType === "drive-in" ||
    (state.serviceType === "mobile" &&
      state.addressValidation?.status === "valid");

  const handleNext = () => {
    switch (state.bookingStep) {
      case "service-type":
        if (
          state.serviceType === "mobile" &&
          (!state.addressValidation ||
            state.addressValidation.status !== "valid")
        ) {
          return;
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
    switch (state.bookingStep) {
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

  // Option Handling
  const handleOptionSelect = (options) => {
    dispatch({ type: "SET_OPTIONS", payload: options });
  };

  const handleOptionQuantityChange = (optionId, quantity) => {
    const q = Math.max(1, Math.min(4, Number(quantity) || 1));
    dispatch({
      type: "SET_OPTION_QUANTITY",
      payload: { id: optionId, quantity: q },
    });
  };

  // Price Calculation
  const calculateTotalPrice = () => {
    if (!state.selectedService) return 0;

    const selectedServiceDetails = services.find(
      (s) => s._id === state.selectedService || s.id === state.selectedService
    );

    if (!selectedServiceDetails) return 0;

    let servicePrice =
      selectedServiceDetails.vehiclePricing[state.selectedVehicleType];

    if (state.serviceType === "mobile") {
      servicePrice += CONFIG.MOBILE_SERVICE.UPCHARGE;
    }

    const optionalServicesTotal = state.selectedOptions.reduce(
      (sum, optionId) => {
        const optionDetails = optionalServices.find(
          (service) => service.id.toString() === optionId.toString()
        );
        if (!optionDetails) return sum;

        const basePrice = parseFloat(optionDetails.price);
        if (optionDetails.name?.toLowerCase() === "seat cloth shampoo") {
          const q = Math.max(
            1,
            Math.min(4, state.optionQuantities?.[optionId] || 1)
          );
          return sum + basePrice * q;
        }
        return sum + basePrice;
      },
      0
    );

    return servicePrice + optionalServicesTotal;
  };

  const calculateBaseServicePrice = () => {
    if (!state.selectedService) return 0;

    const selectedServiceDetails = services.find(
      (s) => s._id === state.selectedService || s.id === state.selectedService
    );

    if (!selectedServiceDetails) return 0;

    return selectedServiceDetails.vehiclePricing[state.selectedVehicleType];
  };

  // Validation
  const validateBookingData = (formData) => {
    const errors = {};

    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.contact?.trim()) errors.contact = "Contact is required";
    if (!formData.makeModel?.trim())
      errors.makeModel = "Vehicle make/model is required";
    if (!formData.dateTime?.trim())
      errors.dateTime = "Date and time is required";

    if (!state.selectedService)
      errors.service = "Service selection is required";
    if (!state.selectedScent) errors.scent = "Scent selection is required";

    if (state.serviceType === "mobile") {
      if (!state.customerAddress?.trim()) {
        errors.address = "Address is required for mobile service";
      } else if (
        !state.addressValidation ||
        state.addressValidation.status !== "valid"
      ) {
        errors.address =
          "Please provide a valid address within our service area";
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (formData.contact && formData.contact.trim()) {
      const phoneRegex = /^[\d\s\-().+]{10,}$/;
      if (!phoneRegex.test(formData.contact.trim())) {
        errors.contact = "Please enter a valid phone number";
      }
    }

    return errors;
  };

  // Submission
  const handleBookingSubmit = async (formData) => {
    if (formData.captchaAnswer === state.captcha.answer) {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const validationErrors = validateBookingData(formData);
        if (Object.keys(validationErrors).length > 0) {
          throw new Error(
            "Validation failed: " + Object.values(validationErrors).join(", ")
          );
        }

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
          (s) =>
            s._id === state.selectedService || s.id === state.selectedService
        );

        const selectedScentDetails = scents.find(
          (s) => s.id === state.selectedScent
        );
        const selectedScentName = selectedScentDetails?.name || "None";

        const formattedOptionalServices = state.selectedOptions.map(
          (optionId) => {
            const optionDetails = optionalServices.find(
              (service) => service.id.toString() === optionId.toString()
            );
            const basePrice = parseFloat(optionDetails.price);
            let name = optionDetails.name;
            let price = basePrice;

            if (name?.toLowerCase() === "seat cloth shampoo") {
              const q = Math.max(
                1,
                Math.min(4, state.optionQuantities?.[optionId] || 1)
              );
              price = basePrice * q;
              name = `${name} (x${q} seat${q > 1 ? "s" : ""})`;
            }

            return {
              serviceId: optionDetails.id,
              name,
              price,
            };
          }
        );

        let servicePrice =
          selectedServiceDetails.vehiclePricing[state.selectedVehicleType];
        if (state.serviceType === "mobile") {
          servicePrice += CONFIG.MOBILE_SERVICE.UPCHARGE;
        }

        const optionalServicesTotal = formattedOptionalServices.reduce(
          (sum, service) => sum + service.price,
          0
        );

        const totalPrice = servicePrice + optionalServicesTotal;

        const bookingPayload = {
          name: formData.name,
          contact: formData.contact,
          email: formData.email,
          vehicleType: state.selectedVehicleType,
          makeModel: formData.makeModel,
          dateTime: formData.dateTime,
          serviceId: state.selectedService,
          serviceName: selectedServiceDetails.name,
          selectedScent: selectedScentName,
          servicePrice:
            selectedServiceDetails.vehiclePricing[state.selectedVehicleType],
          optionalServices: formattedOptionalServices,
          totalPrice: totalPrice,
          serviceType: state.serviceType,
          ...(state.serviceType === "mobile" &&
            state.addressValidation?.status === "valid" && {
              customerAddress: {
                street: state.addressValidation.addressComponents?.street || "",
                city: state.addressValidation.addressComponents?.city || "",
                state: state.addressValidation.addressComponents?.state || "",
                zipCode:
                  state.addressValidation.addressComponents?.zipCode || "",
                coordinates: state.addressValidation.coordinates,
              },
              mobileDetails: {
                parkingType: state.mobileDetails.parkingType,
                hasWater: state.mobileDetails.hasWater,
                hasPower: state.mobileDetails.hasPower,
                accessNotes: state.mobileDetails.accessNotes,
                arriveContactMethod: state.mobileDetails.arriveContactMethod,
              },
            }),
        };

        if (state.serviceType === "mobile") {
          dispatch({ type: "SET_PENDING_PAYLOAD", payload: bookingPayload });
          return;
        }

        const response = await fetch(`${CONFIG.API_URL}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create booking");
        }

        const result = await response.json();
        dispatch({ type: "SET_BOOKING_SUCCESS", payload: result.data });
      } catch (error) {
        console.error("Booking submission error:", error);
        dispatch({ type: "SET_ERROR", payload: error.message });
      }
    } else {
      dispatch({
        type: "SET_ERROR",
        payload: "Incorrect captcha answer. Please try again.",
      });
      dispatch({ type: "SET_CAPTCHA", payload: generateCaptcha() });
    }
  };

  const finalizeMobileBooking = async ({
    depositToken,
    fields,
    customerDetails,
  }) => {
    if (!state.pendingBookingPayload) return;

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const payload = {
        ...state.pendingBookingPayload,
        depositToken,
        ...(fields && {
          mobileDetails: {
            ...state.pendingBookingPayload.mobileDetails,
            ...fields,
          },
        }),
        ...(customerDetails && {
          name: customerDetails.name || state.pendingBookingPayload.name,
          email: customerDetails.email || state.pendingBookingPayload.email,
        }),
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
      dispatch({ type: "SET_BOOKING_SUCCESS", payload: result.data });
    } catch (err) {
      console.error("Mobile booking finalize error:", err);
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  };

  const resetBookingState = () => {
    dispatch({ type: "RESET", payload: { captcha: generateCaptcha() } });
  };

  // Progress Calculation
  const getProgress = () => {
    const steps =
      state.serviceType === "mobile"
        ? ["service-type", "service", "options", "details", "payment"]
        : ["service-type", "service", "options", "details"];
    const currentIndex = steps.indexOf(state.bookingStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return {
    // State
    ...state,
    services,
    vehicleTypes,
    scents,
    optionalServices,

    // Computed
    canProceedToDetails,
    canProceedFromServiceType,
    totalPrice: calculateTotalPrice(),
    baseServicePrice: calculateBaseServicePrice(),
    progress: getProgress(),

    // Handlers
    setSelectedVehicleType: handleVehicleTypeChange, // Alias for compatibility
    handleVehicleTypeChange,
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
    handleServiceTypeChange,
    handleAddressChange,
    validateAddress,
    finalizeMobileBooking,
    setMobileDetails,
    resetBookingState,
  };
};
