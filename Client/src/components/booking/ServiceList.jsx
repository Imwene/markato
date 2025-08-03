import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check, MapPin, Car } from "lucide-react";
import { useServices } from "../../hooks/useServices";
import { useConfig } from "../../hooks/useConfig";
import { CONFIG } from "../../config/config";

const ServiceList = ({
  selectedService,
  selectedScent,
  onServiceSelect,
  onScentSelect,
  selectedVehicleType,
  onContinue,
  canProceedToDetails,
  serviceType = "drive-in", // NEW: Add service type prop
}) => {
  const [expandedService, setExpandedService] = useState(null);
  const { services, loading, error } = useServices();
  const { scents, loading: configLoading } = useConfig();

  useEffect(() => {
    setExpandedService(null);
    onServiceSelect(null);
    onScentSelect(null);
  }, [selectedVehicleType]);

  const handleServiceClick = (service) => {
    const serviceId = service._id || service.id;
    if (serviceId === expandedService) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceId);
      onServiceSelect(serviceId);
      onScentSelect(null);
    }
  };

  const handleScentSelect = (e, scentId) => {
    e.stopPropagation();
    onScentSelect(scentId);
  };

  // NEW: Updated pricing function to include mobile service upcharge
  const getPrice = (service) => {
    const basePrice = service?.vehiclePricing?.[selectedVehicleType] || 0;

    // Add mobile service upcharge if applicable
    if (serviceType === "mobile") {
      return basePrice + CONFIG.MOBILE_SERVICE.UPCHARGE;
    }

    return basePrice;
  };

  // NEW: Get base price without mobile upcharge
  const getBasePrice = (service) => {
    return service?.vehiclePricing?.[selectedVehicleType] || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* NEW: Service type indicator */}
      {serviceType === "mobile" && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div className="text-sm">
              <p className="font-medium text-orange-700 dark:text-orange-300">
                Mobile Service Selected
              </p>
              <p className="text-orange-600 dark:text-orange-400">
                All prices include a ${CONFIG.MOBILE_SERVICE.UPCHARGE} mobile
                service fee
              </p>
            </div>
          </div>
        </div>
      )}

      {services.map((service) => {
        const serviceId = service._id || service.id;
        return (
          <motion.div
            key={serviceId}
            className={`
              rounded-lg overflow-hidden relative  
              ${
                selectedService === serviceId
                  ? "ring-2 ring-primary-light dark:ring-orange-500"
                  : ""
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="p-4 cursor-pointer border border-border-light dark:border-stone-700 rounded-lg 
                         bg-background-light dark:bg-stone-800
                         hover:bg-background-dark dark:hover:bg-stone-700 transition-colors duration-200"
              onClick={() => handleServiceClick(service)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-content-dark dark:text-white">
                    {service.name}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {service.features?.map((feature, index) => (
                      <li
                        key={`${serviceId}-feature-${index}`}
                        className="flex items-center text-sm text-content-light dark:text-stone-400"
                      >
                        <Check className="w-4 h-4 mr-2 text-primary-light dark:text-orange-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-end ml-4">
                  {/* NEW: Enhanced pricing display */}
                  <div className="text-right">
                    {serviceType === "mobile" ? (
                      <>
                        <div className="text-lg font-bold text-primary-DEFAULT dark:text-orange-500">
                          ${getPrice(service)}
                        </div>
                        <div className="text-xs text-content-light dark:text-stone-500">
                          ${getBasePrice(service)} + $
                          {CONFIG.MOBILE_SERVICE.UPCHARGE} mobile
                        </div>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-primary-DEFAULT dark:text-orange-500">
                        ${getPrice(service)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    {expandedService === serviceId ? (
                      <ChevronUp className="w-5 h-5 text-content-light dark:text-stone-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-content-light dark:text-stone-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedService === serviceId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-background-dark dark:bg-stone-700 border-t border-border-light dark:border-stone-600">
                    <h4 className="text-sm font-semibold text-content-dark dark:text-white mb-3">
                      Choose Your Scent:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {scents.map((scent) => (
                        <motion.button
                          key={scent.id}
                          onClick={(e) => handleScentSelect(e, scent.id)}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              selectedScent === scent.id
                                ? "bg-primary-light dark:bg-orange-500 text-white shadow-lg shadow-primary-light/30 dark:shadow-orange-500/30"
                                : "bg-background-light dark:bg-stone-800 text-content-DEFAULT dark:text-stone-300 hover:bg-background-dark dark:hover:bg-stone-700 border border-border-light dark:border-stone-700"
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="block text-center">
                            {scent.name}
                          </span>
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
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-stone-900/95 backdrop-blur-sm border-t border-border-light dark:border-stone-700">
          <motion.button
            onClick={onContinue}
            className="w-full p-3 rounded-lg bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue to Add-ons
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ServiceList;
