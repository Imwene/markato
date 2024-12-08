import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Plus } from 'lucide-react';

const OptionalServices = ({ 
  optionalServices, 
  selectedOptions, 
  onOptionSelect, 
  onContinue 
}) => {
  const handleOptionToggle = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      onOptionSelect(selectedOptions.filter(id => id !== optionId));
    } else {
      onOptionSelect([...selectedOptions, optionId]);
    }
  };

  const calculateTotal = () => {
    return optionalServices
      .filter(service => selectedOptions.includes(service.id))
      .reduce((total, service) => total + parseFloat(service.price), 0)
      .toFixed(2);
  };

  return (
    <div className="relative pb-20"> {/* Add padding bottom to prevent button overlap */}
      <div className="space-y-4">
        {optionalServices.map((service) => (
          <motion.div
            key={service.id}
            className={`
              relative p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200
              ${selectedOptions.includes(service.id) 
                ? 'border-orange-500 bg-neutral-800' 
                : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600'
              }
            `}
            onClick={() => handleOptionToggle(service.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h4 className="text-lg font-medium">{service.name}</h4>
                <p className="text-sm text-neutral-400 mt-1">{service.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-orange-500">
                  ${service.price}
                </span>
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center
                  ${selectedOptions.includes(service.id)
                    ? 'bg-orange-500'
                    : 'border-2 border-neutral-600'
                  }
                `}>
                  {selectedOptions.includes(service.id) 
                    ? <CheckCircle className="w-4 h-4 text-white" />
                    : <Plus className="w-4 h-4 text-neutral-400" />
                  }
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedOptions.length > 0 && (
        <div className="text-right py-3 border-t border-neutral-700">
          <p className="text-sm text-neutral-400">Additional Services Total:</p>
          <p className="text-xl font-bold text-orange-500">${calculateTotal()}</p>
        </div>
      )}

      {/* Updated sticky button container */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800">
        <div className="max-w-[1000px] mx-auto"> {/* Match parent container width */}
          <motion.button
            onClick={onContinue}
            className="w-full p-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to Booking Details
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OptionalServices;