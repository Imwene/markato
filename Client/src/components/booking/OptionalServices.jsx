// src/components/booking/OptionalServices.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Plus } from 'lucide-react';

const OptionalServices = ({ 
  optionalServices,
  selectedOptions,
  onOptionSelect,
  onContinue,  // Add navigation props
  onBack
}) => {
  const handleOptionToggle = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      onOptionSelect(selectedOptions.filter(id => id !== optionId));
    } else {
      onOptionSelect([...selectedOptions, optionId]);
    }
  };

  const calculateTotal = () => {
    const total = optionalServices
      .filter(service => selectedOptions.includes(service.id.toString()))
      .reduce((total, service) => total + parseFloat(service.price), 0);
    return total.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {optionalServices.map((service) => (
          <motion.div
            key={service.id}
            className={`
              relative p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200
              ${selectedOptions.includes(service.id.toString()) 
                ? 'border-primary-light bg-primary-light/5' 
                : 'border-border-DEFAULT bg-background-light hover:border-border-dark'
              }
            `}
            onClick={() => handleOptionToggle(service.id.toString())}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h4 className="text-lg font-medium text-content-dark">{service.name}</h4>
                <p className="text-sm text-content-light mt-1">{service.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary-DEFAULT">
                  ${service.price}
                </span>
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${selectedOptions.includes(service.id.toString())
                    ? 'bg-primary-light'
                    : 'border-2 border-border-DEFAULT'
                  }
                `}>
                  {selectedOptions.includes(service.id.toString())
                    ? <CheckCircle className="w-4 h-4 text-white" />
                    : <Plus className="w-4 h-4 text-content-light" />
                  }
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedOptions.length > 0 && (
        <div className="py-3 border-t border-border-light">
          <div className="flex justify-between items-center">
            <p className="text-sm text-content-light">Additional Services Total:</p>
            <p className="text-xl font-bold text-primary-DEFAULT">${calculateTotal()}</p>
          </div>
        </div>
      )}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 backdrop-blur-sm border-t border-border-light">
  <div className="space-y-3">
    <motion.button
      onClick={onContinue}
      className="w-full p-3 rounded-lg bg-primary-light text-white hover:bg-primary-DEFAULT transition-colors duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Continue to Booking Details
    </motion.button>
    <motion.button
      onClick={onBack}
      className="w-full p-3 rounded-lg bg-background-DEFAULT text-content-DEFAULT border border-border-DEFAULT hover:bg-background-dark transition-colors duration-200"
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