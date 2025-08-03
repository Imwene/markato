import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Plus } from "lucide-react";
import { useConfig } from "../../hooks/useConfig";
import { CONFIG } from "../../config/config";

const OptionalServices = ({
  selectedOptions,
  onOptionSelect,
  onContinue,
  onBack,
  serviceType = "drive-in", // NEW: Add service type prop
  selectedServicePrice = 0, // NEW: Base service price for total calculation
}) => {
  const { optionalServices, loading } = useConfig();

  const handleOptionToggle = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      onOptionSelect(selectedOptions.filter((id) => id !== optionId));
    } else {
      onOptionSelect([...selectedOptions, optionId]);
    }
  };

  // NEW: Enhanced total calculation including mobile service fee
  const calculateOptionalServicesTotal = () => {
    const total = optionalServices
      .filter((service) => selectedOptions.includes(service.id.toString()))
      .reduce((total, service) => total + parseFloat(service.price), 0);
    return total;
  };

  const calculateGrandTotal = () => {
    const optionalTotal = calculateOptionalServicesTotal();
    let servicePrice = selectedServicePrice;

    // Add mobile service upcharge if applicable
    if (serviceType === "mobile") {
      servicePrice += CONFIG.MOBILE_SERVICE.UPCHARGE;
    }

    return servicePrice + optionalTotal;
  };

  if (loading) {
    return <div>Loading optional services...</div>;
  }

  return (
    <div className="space-y-6">
      {/* NEW: Service type and pricing info */}
      {serviceType === "mobile" && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="text-sm">
            <p className="font-medium text-orange-700 dark:text-orange-300 mb-1">
              Mobile Service Selected
            </p>
            <p className="text-orange-600 dark:text-orange-400">
              A ${CONFIG.MOBILE_SERVICE.UPCHARGE} mobile service fee is included
              in your total. A 50% deposit will be required at booking
              confirmation.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {optionalServices.map((service) => (
          <motion.div
            key={service.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200
              ${
                selectedOptions.includes(service.id.toString())
                  ? "bg-primary-light/5 dark:bg-orange-500/10 border-primary-light dark:border-orange-500"
                  : "bg-white dark:bg-stone-800 border-primary-light/50 dark:border-orange-500/20 hover:border-primary-light/80 dark:hover:border-orange-500/40"
              }`}
            onClick={() => handleOptionToggle(service.id.toString())}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h4 className="text-lg font-medium text-content-dark dark:text-white">
                  {service.name}
                </h4>
                <p className="text-sm text-content-light dark:text-stone-400 mt-1">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary-DEFAULT dark:text-orange-500">
                  ${service.price}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center
                  ${
                    selectedOptions.includes(service.id.toString())
                      ? "bg-primary-light dark:bg-orange-500"
                      : "border-2 border-primary-light/50 dark:border-orange-500/20"
                  }`}
                >
                  {selectedOptions.includes(service.id.toString()) ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-primary-light/50 dark:text-orange-500/20" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* NEW: Enhanced pricing breakdown */}
      {(selectedOptions.length > 0 || serviceType === "mobile") && (
        <div className="p-4 bg-background-dark dark:bg-stone-700 rounded-lg space-y-3">
          <h4 className="font-medium text-content-dark dark:text-white">
            Pricing Breakdown:
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-content-light dark:text-stone-400">
                Base Service:
              </span>
              <span className="text-content-DEFAULT dark:text-white">
                ${selectedServicePrice.toFixed(2)}
              </span>
            </div>

            {serviceType === "mobile" && (
              <div className="flex justify-between">
                <span className="text-content-light dark:text-stone-400">
                  Mobile Service Fee:
                </span>
                <span className="text-orange-600 dark:text-orange-400">
                  +${CONFIG.MOBILE_SERVICE.UPCHARGE.toFixed(2)}
                </span>
              </div>
            )}

            {selectedOptions.length > 0 && (
              <div className="flex justify-between">
                <span className="text-content-light dark:text-stone-400">
                  Optional Services:
                </span>
                <span className="text-content-DEFAULT dark:text-white">
                  +${calculateOptionalServicesTotal().toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t border-border-light dark:border-stone-600 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-content-dark dark:text-white">
                  Total:
                </span>
                <span className="text-xl font-bold text-primary-DEFAULT dark:text-orange-500">
                  ${calculateGrandTotal().toFixed(2)}
                </span>
              </div>

              {serviceType === "mobile" && (
                <div className="mt-2 text-xs text-content-light dark:text-stone-400">
                  Deposit Required: $
                  {(
                    calculateGrandTotal() *
                    CONFIG.MOBILE_SERVICE.DEPOSIT_PERCENTAGE
                  ).toFixed(2)}{" "}
                  (50%)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <motion.button
          onClick={onBack}
          className="flex-1 p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-700 text-content-DEFAULT dark:text-white border border-border-DEFAULT dark:border-stone-600 hover:bg-background-dark dark:hover:bg-stone-600 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back to Services
        </motion.button>

        <motion.button
          onClick={onContinue}
          className="flex-1 p-3 rounded-lg bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Details
        </motion.button>
      </div>
    </div>
  );
};

export default OptionalServices;