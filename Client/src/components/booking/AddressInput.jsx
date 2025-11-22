// src/components/booking/AddressInput.jsx
import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import PropTypes from "prop-types";
import { useDebounce } from "../../hooks/useDebounce";
import { CONFIG } from "../../config/config";

// Minimum address length required for validation
const MIN_ADDRESS_LENGTH = 10;
const VALIDATION_DEBOUNCE_MS = 1000;
const SUGGESTION_DEBOUNCE_MS = 300;

// Helper function to check if validation status is an error state
const isErrorStatus = (status) => {
  return (
    status === "invalid" ||
    status === "outside_service_area" ||
    status === "outside_east_bay"
  );
};

// Memoized service area info component (static content)
const ServiceAreaInfo = memo(() => (
  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
    <div className="flex items-center space-x-2">
      <MapPin className="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-400" />
      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
        East Bay only • Within 15 miles of Oakland • SF/Peninsula not serviced
      </p>
    </div>
  </div>
));

ServiceAreaInfo.displayName = "ServiceAreaInfo";

// Memoized validation icon component
const ValidationIcon = memo(({ isValidating, status }) => {
  if (isValidating) {
    return <Loader2 className="animate-spin text-blue-500" size={20} />;
  }

  if (!status) return null;

  switch (status) {
    case "valid":
      return <CheckCircle className="text-green-500" size={20} />;
    case "invalid":
      return <XCircle className="text-red-500" size={20} />;
    case "outside_service_area":
      return <AlertTriangle className="text-orange-500" size={20} />;
    case "outside_east_bay":
      return <XCircle className="text-red-500" size={20} />;
    default:
      return null;
  }
});

ValidationIcon.displayName = "ValidationIcon";

ValidationIcon.propTypes = {
  isValidating: PropTypes.bool.isRequired,
  status: PropTypes.string,
};

const AddressInput = ({
  address,
  onAddressChange,
  onValidateAddress,
  validationStatus,
  className = "",
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Debounced suggestion fetcher
  const fetchSuggestions = useDebounce(async (input) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${CONFIG.API_URL}${
          CONFIG.ENDPOINTS.BOOKINGS.ADDRESS_SUGGESTIONS
        }?input=${encodeURIComponent(input)}`
      );
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.predictions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, SUGGESTION_DEBOUNCE_MS);

  // Memoize validation status check
  const hasErrorStatus = useMemo(
    () => validationStatus && isErrorStatus(validationStatus.status),
    [validationStatus]
  );

  // Memoize input border styling
  const inputClassName = useMemo(() => {
    let borderClass =
      "border-border-DEFAULT dark:border-stone-700 bg-background-light dark:bg-stone-800";

    if (validationStatus?.status === "valid") {
      borderClass =
        "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20";
    } else if (hasErrorStatus) {
      borderClass =
        "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20";
    }

    return `
      w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200
      ${borderClass}
      text-content-DEFAULT dark:text-white placeholder-content-light dark:placeholder-stone-500
      focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-orange-500 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
  }, [validationStatus?.status, hasErrorStatus]);

  // Memoize validation message
  const validationMessage = useMemo(() => {
    if (isValidating) {
      return {
        text: "Validating address...",
        color: "text-blue-600 dark:text-blue-400",
      };
    }

    if (!validationStatus) return null;

    const { status, distance, message } = validationStatus;

    switch (status) {
      case "valid":
        return {
          text: `✓ Address validated${
            distance != null
              ? ` (${distance.toFixed(1)} miles from our Oakland location)`
              : ""
          }`,
          color: "text-green-600 dark:text-green-400",
        };
      case "invalid":
        return {
          text: `✗ ${
            message || "Invalid address. Please check and try again."
          }`,
          color: "text-red-600 dark:text-red-400",
        };
      case "outside_service_area":
        return {
          text: `⚠ Address is ${
            distance != null ? `${distance.toFixed(1)} miles` : "too far"
          } away (outside our 15-mile East Bay service area)`,
          color: "text-orange-600 dark:text-orange-400",
        };
      case "outside_east_bay":
        return {
          text: `✗ ${
            message ||
            "Address is outside our East Bay service area (West Bay/Peninsula not serviced)"
          }`,
          color: "text-red-600 dark:text-red-400",
        };
      default:
        return null;
    }
  }, [isValidating, validationStatus]);

  // Debounced validation handler with cancel support
  const debouncedValidate = useDebounce(async (value) => {
    try {
      await onValidateAddress(value);
    } finally {
      setIsValidating(false);
    }
  }, VALIDATION_DEBOUNCE_MS);

  // Handle address input changes with debouncing
  const handleAddressChange = useCallback(
    (e) => {
      const value = e.target.value;
      onAddressChange(value);

      // Fetch suggestions
      fetchSuggestions.run(value);

      // Only validate if address has sufficient content
      if (value.trim().length >= MIN_ADDRESS_LENGTH) {
        setIsValidating(true);
        debouncedValidate.run(value);
      } else {
        // Cancel any pending validation and reset state
        debouncedValidate.cancel();
        setIsValidating(false);
      }
    },
    [onAddressChange, debouncedValidate, fetchSuggestions]
  );

  const handleSuggestionClick = async (prediction) => {
    const newAddress = prediction.description;
    onAddressChange(newAddress);
    setSuggestions([]);
    setShowSuggestions(false);

    // Trigger validation immediately
    setIsValidating(true);
    try {
      await onValidateAddress(newAddress);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      className={`space-y-3 max-w-3xl mx-auto ${className}`}
      ref={wrapperRef}
    >
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
            value={address || ""}
            onChange={handleAddressChange}
            onFocus={() =>
              address && address.length >= 3 && setShowSuggestions(true)
            }
            placeholder="Enter your East Bay address (e.g., 123 Main St, Oakland, CA 94601)"
            className={inputClassName}
            required
            autoComplete="off"
            aria-describedby={
              validationMessage ? "address-validation-message" : undefined
            }
            aria-invalid={hasErrorStatus}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <ValidationIcon
              isValidating={isValidating}
              status={validationStatus?.status}
            />
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-border-DEFAULT dark:border-stone-700 max-h-60 overflow-auto"
              >
                {suggestions.map((prediction) => (
                  <li
                    key={prediction.placeId}
                    onClick={() => handleSuggestionClick(prediction)}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-stone-700 cursor-pointer transition-colors duration-150 border-b border-border-light dark:border-stone-700 last:border-0"
                  >
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-content-DEFAULT dark:text-white">
                          {prediction.mainText}
                        </p>
                        <p className="text-xs text-content-light dark:text-stone-400">
                          {prediction.secondaryText}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Validation Message */}
      <AnimatePresence>
        {validationMessage && (
          <motion.div
            id="address-validation-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`text-sm ${validationMessage.color} flex items-start space-x-2`}
            role="status"
            aria-live="polite"
          >
            <div className="flex-1">{validationMessage.text}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Area Information */}
      <ServiceAreaInfo />
    </div>
  );
};

AddressInput.propTypes = {
  address: PropTypes.string,
  onAddressChange: PropTypes.func.isRequired,
  onValidateAddress: PropTypes.func.isRequired,
  validationStatus: PropTypes.shape({
    status: PropTypes.oneOf([
      "valid",
      "invalid",
      "outside_service_area",
      "outside_east_bay",
    ]),
    address: PropTypes.string,
    distance: PropTypes.number,
    message: PropTypes.string,
    coordinates: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    formattedAddress: PropTypes.string,
    addressComponents: PropTypes.object,
  }),
  className: PropTypes.string,
};

export default AddressInput;
