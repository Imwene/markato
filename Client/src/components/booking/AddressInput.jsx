// src/components/booking/AddressInput.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const AddressInput = ({
  address,
  onAddressChange,
  onValidateAddress,
  validationStatus,
  className = "",
}) => {
  const [localAddress, setLocalAddress] = useState(address || "");
  const [isValidating, setIsValidating] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState(null);

  // Handle address input changes with debouncing
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setLocalAddress(value);
    onAddressChange(value);

    // Clear existing timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // Only validate if address has sufficient content
    if (value.trim().length > 10) {
      setIsValidating(true);

      // Debounce validation by 1 second
      const timeout = setTimeout(() => {
        onValidateAddress(value);
        setIsValidating(false);
      }, 1000);

      setValidationTimeout(timeout);
    }
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  // Update local state when external address changes
  useEffect(() => {
    setLocalAddress(address || "");
  }, [address]);

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="animate-spin text-blue-500" size={20} />;
    }

    if (!validationStatus) return null;

    switch (validationStatus.status) {
      case "valid":
        return <CheckCircle className="text-green-500" size={20} />;
      case "invalid":
        return <XCircle className="text-red-500" size={20} />;
      case "outside_service_area":
        return <AlertTriangle className="text-orange-500" size={20} />;
      default:
        return null;
    }
  };

  const getValidationMessage = () => {
    if (isValidating) {
      return {
        text: "Validating address...",
        color: "text-blue-600 dark:text-blue-400",
      };
    }

    if (!validationStatus) return null;

    switch (validationStatus.status) {
      case "valid":
        return {
          text: `✓ Address validated (${validationStatus.distance?.toFixed(
            1
          )} miles from our location)`,
          color: "text-green-600 dark:text-green-400",
        };
      case "invalid":
        return {
          text: `✗ ${
            validationStatus.message ||
            "Invalid address. Please check and try again."
          }`,
          color: "text-red-600 dark:text-red-400",
        };
      case "outside_service_area":
        return {
          text: `⚠ Address is ${validationStatus.distance?.toFixed(
            1
          )} miles away (outside our 40-mile service area)`,
          color: "text-orange-600 dark:text-orange-400",
        };
      default:
        return null;
    }
  };

  const validationMessage = getValidationMessage();

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label
          htmlFor="service-address"
          className="block text-sm font-medium text-content-dark dark:text-white mb-2"
        >
          Service Address <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-content-light dark:text-stone-400" />
          </div>

          <input
            id="service-address"
            type="text"
            value={localAddress}
            onChange={handleAddressChange}
            placeholder="Enter your full address (e.g., 123 Main St, Oakland, CA 94601)"
            className={`
              w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200
              ${
                validationStatus?.status === "valid"
                  ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
                  : validationStatus?.status === "invalid" ||
                    validationStatus?.status === "outside_service_area"
                  ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20"
                  : "border-border-DEFAULT dark:border-stone-700 bg-background-light dark:bg-stone-800"
              }
              text-content-DEFAULT dark:text-white placeholder-content-light dark:placeholder-stone-500
              focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-orange-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            required
            aria-describedby={
              validationMessage ? "address-validation-message" : undefined
            }
            aria-invalid={
              validationStatus?.status === "invalid" ||
              validationStatus?.status === "outside_service_area"
            }
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {getValidationIcon()}
          </div>
        </div>
      </div>

      {/* Validation Message */}
      <AnimatePresence>
        {validationMessage && (
          <motion.div
            id="address-validation-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`text-sm ${validationMessage.color} flex items-start space-x-2`}
            role="status"
            aria-live="polite"
          >
            <div className="flex-1">{validationMessage.text}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Area Information */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <MapPin className="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">Service Area Information:</p>
            <p className="mt-1">
              We provide mobile service within 40 miles of our Oakland location
              (1901 Park Blvd). Please enter your complete address including
              street, city, state, and zip code for accurate validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
