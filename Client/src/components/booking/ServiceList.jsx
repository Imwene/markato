import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scents } from "../../constants";
import { ChevronDown, ChevronUp } from "lucide-react";

const ServiceList = ({
  services,
  selectedService,
  selectedScent,
  onServiceSelect,
  onScentSelect,
}) => {
  const [expandedService, setExpandedService] = useState(null);

  const handleServiceClick = (serviceId) => {
    onServiceSelect(serviceId);
    setExpandedService(serviceId === expandedService ? null : serviceId);
  };

  const handleScentSelect = (scentId) => {
    onScentSelect(scentId);
  };

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <motion.div
          key={service.id}
          className={`bg-neutral-900 rounded-lg overflow-hidden ${
            selectedService === service.id
              ? "border-2 border-orange-500"
              : "border border-neutral-700"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="p-4 cursor-pointer hover:bg-neutral-800 transition-colors duration-200"
            onClick={() => handleServiceClick(service.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {service.name}
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-orange-500">
                  ${service.price}
                </span>
                {expandedService === service.id ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {expandedService === service.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-neutral-700"
              >
                <div className="p-4 bg-neutral-800">
                  <h4 className="text-sm font-semibold text-neutral-300 mb-3">
                    Select your preferred scent:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {scents.map((scent) => (
                      <motion.button
                        key={scent.id}
                        onClick={() => handleScentSelect(scent.id)}
                        className={`
                          p-3 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            selectedScent === scent.id
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                              : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="block text-center">{scent.name}</span>
                        {scent.description && (
                          <span className="block text-xs mt-1 opacity-75">
                            {scent.description}
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default ServiceList;
