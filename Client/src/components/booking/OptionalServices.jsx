import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Plus } from "lucide-react";
import { useConfig } from "../../hooks/useConfig";

const OptionalServices = ({
  selectedOptions,
  onOptionSelect,
  onContinue,
  onBack,
}) => {
  const { optionalServices, loading } = useConfig();

  const handleOptionToggle = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      onOptionSelect(selectedOptions.filter((id) => id !== optionId));
    } else {
      onOptionSelect([...selectedOptions, optionId]);
    }
  };

  const calculateTotal = () => {
    const total = optionalServices
      .filter((service) => selectedOptions.includes(service.id.toString()))
      .reduce((total, service) => total + parseFloat(service.price), 0);
    return total.toFixed(2);
  };

  if (loading) {
    return <div>Loading optional services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {optionalServices.map((service) => (
          <motion.div
            key={service.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200
              ${selectedOptions.includes(service.id.toString())
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
                  ${selectedOptions.includes(service.id.toString())
                    ? "bg-primary-light dark:bg-orange-500"
                    : "border-2 border-primary-light/50 dark:border-orange-500/20"
                  }`}
                >
                  {selectedOptions.includes(service.id.toString()) ? (
                    <CheckCircle className="w-4 h-4 text-content-dark dark:text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-content-light dark:text-stone-400" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedOptions.length > 0 && (
        <div className="py-3 border-t border-primary-light/30 dark:border-stone-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-content-light dark:text-stone-400">
              Additional Services Total:
            </p>
            <p className="text-xl font-bold text-primary-DEFAULT dark:text-orange-500">
              ${calculateTotal()}
            </p>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 left-0 right-0 p-4 
                bg-background-light/95 dark:bg-stone-900/95 
                backdrop-blur-sm border-t border-primary-light/30 dark:border-stone-700">
        <div className="space-y-3">
          <motion.button
            onClick={onContinue}
            className="w-full p-3 rounded-lg bg-primary-light dark:bg-orange-500 
            text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
            transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue to Booking Details
          </motion.button>
          <motion.button
            onClick={onBack}
            className="w-full p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 
            text-content-DEFAULT dark:text-white 
            border border-primary-light/50 dark:border-stone-700 
            hover:bg-background-dark dark:hover:bg-stone-700 
            transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Services
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OptionalServices;