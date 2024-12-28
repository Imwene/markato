// src/components/booking/ServiceList.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useServices } from "../../hooks/useServices";
import { useConfig } from "../../hooks/useConfig";

const ServiceList = ({
  selectedService,
  selectedScent,
  onServiceSelect,
  onScentSelect,
  selectedVehicleType,
  onContinue,  // Add this prop
  canProceedToDetails  // Add this prop
}) => {
  const [expandedService, setExpandedService] = useState(null);
  const { services, loading, error } = useServices();
  const { scents, loading: configLoading } = useConfig(); 

  // Reset expanded service when vehicle type changes
  useEffect(() => {
    setExpandedService(null);
    onServiceSelect(null);
    onScentSelect(null);
  }, [selectedVehicleType]);

  const handleServiceClick = (service) => {
    const serviceId = service._id || service.id;
    if (serviceId === expandedService) {
      // If clicking the expanded service, just close it
      setExpandedService(null);
    } else {
      // If clicking a new service, expand it and select it
      setExpandedService(serviceId);
      onServiceSelect(serviceId);
      // Reset scent selection when changing service
      onScentSelect(null);
    }
  };

  const handleScentSelect = (e, scentId) => {
    e.stopPropagation(); // Prevent service expansion toggle
    onScentSelect(scentId);
  };

  const getPrice = (service) => {
    return service?.vehiclePricing?.[selectedVehicleType] || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => {
        const serviceId = service._id || service.id;
        return (
          <motion.div
            key={serviceId}
            className={`
              bg-background-light rounded-lg overflow-hidden 
              ${
                selectedService === serviceId
                  ? "border-2 border-primary-light shadow-lg shadow-primary-light/10"
                  : "border border-border-DEFAULT hover:border-border-dark"
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="p-4 cursor-pointer hover:bg-background-dark transition-colors duration-200"
              onClick={() => handleServiceClick(service)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-content-dark">
                    {service.name}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {service.features?.map((feature, index) => (
                      <li 
                        key={`${serviceId}-feature-${index}`}
                        className="flex items-center text-sm text-content-light"
                      >
                        <Check className="w-4 h-4 mr-2 text-primary-light" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-end ml-4">
                  <span className="text-lg font-bold text-primary-DEFAULT">
                    ${getPrice(service)}
                  </span>
                  <div className="mt-2">
                    {expandedService === serviceId ? (
                      <ChevronUp className="w-5 h-5 text-content-light" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-content-light" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedService === serviceId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border-light"
                >
                  <div className="p-4 bg-background-DEFAULT">
                    <h4 className="text-sm font-semibold text-content-DEFAULT mb-3">
                      Select your preferred scent:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {scents.map((scent) => (
                        <motion.button
                          key={`scent-${scent.id}`}
                          onClick={(e) => handleScentSelect(e, scent.id)}
                          className={`
                            p-3 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              selectedScent === scent.id
                                ? "bg-primary-light text-white shadow-lg shadow-primary-light/30"
                                : "bg-background-light text-content-DEFAULT hover:bg-background-dark border border-border-light"
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="block text-center">{scent.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      {canProceedToDetails && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 backdrop-blur-sm border-t border-border-light">
          <motion.button
            onClick={onContinue}
            className="w-full p-3 rounded-lg bg-primary-light text-white hover:bg-primary-DEFAULT transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ServiceList;