import React from "react";
import { motion } from "framer-motion";
import { MapPin, Car } from "lucide-react";

const ServiceTypeToggle = ({ serviceType, onServiceTypeChange }) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
      <h3 className="text-xl font-bold text-content-dark dark:text-white text-center">
        Select Your Service
      </h3>

      <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
        {/* Drive-In Service Option */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`
            relative p-5 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
            shadow-sm hover:shadow-md
            ${
              serviceType === "drive-in"
                ? "border-primary-light dark:border-orange-500 bg-primary-light/10 dark:bg-orange-500/15"
                : "border-border-DEFAULT dark:border-stone-700 bg-background-light dark:bg-stone-800"
            }
          `}
          onClick={() => onServiceTypeChange("drive-in")}
        >
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
            <div
              className={`
                p-3 rounded-full transition-colors duration-200 self-start
                ${
                  serviceType === "drive-in"
                    ? "bg-primary-light dark:bg-orange-500 text-white"
                    : "bg-background-DEFAULT dark:bg-stone-700 text-content-light dark:text-stone-400"
                }
              `}
            >
              <Car size={28} />
            </div>

            <div className="flex-1">
              <h4
                className={`
                  text-lg font-semibold
                  ${
                    serviceType === "drive-in"
                      ? "text-primary-dark dark:text-orange-400"
                      : "text-content-dark dark:text-white"
                  }
                `}
              >
                Drive-In Service
              </h4>
              <div className="text-sm text-content-light dark:text-stone-400 space-y-2 mt-2">
                <p>Visit us at</p>
                <p className="font-medium text-content-DEFAULT dark:text-stone-300">
                  1901 Park Blvd, Oakland, CA
                </p>
                <div className="mt-3">
                  <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                    No Additional Fee
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`
                absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-200
                ${
                  serviceType === "drive-in"
                    ? "border-primary-light dark:border-orange-500 bg-primary-light dark:bg-orange-500"
                    : "border-border-DEFAULT dark:border-stone-600"
                }
              `}
            >
              {serviceType === "drive-in" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-full h-full rounded-full bg-white dark:bg-white flex items-center justify-center"
                >
                  <div className="w-3 h-3 rounded-full bg-primary-light dark:bg-orange-500" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mobile Service Option */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`
            relative p-5 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
            shadow-sm hover:shadow-md
            ${
              serviceType === "mobile"
                ? "border-primary-light dark:border-orange-500 bg-primary-light/10 dark:bg-orange-500/15"
                : "border-border-DEFAULT dark:border-stone-700 bg-background-light dark:bg-stone-800"
            }
          `}
          onClick={() => onServiceTypeChange("mobile")}
        >
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
            <div
              className={`
                p-3 rounded-full transition-colors duration-200 self-start
                ${
                  serviceType === "mobile"
                    ? "bg-primary-light dark:bg-orange-500 text-white"
                    : "bg-background-DEFAULT dark:bg-stone-700 text-content-light dark:text-stone-400"
                }
              `}
            >
              <MapPin size={28} />
            </div>

            <div className="flex-1">
              <h4
                className={`
                  text-lg font-semibold
                  ${
                    serviceType === "mobile"
                      ? "text-primary-dark dark:text-orange-400"
                      : "text-content-dark dark:text-white"
                  }
                `}
              >
                Mobile Service
              </h4>
              <div className="text-sm text-content-light dark:text-stone-400 space-y-2 mt-2">
                <p>We come to you</p>
                <p className="font-medium text-content-DEFAULT dark:text-stone-300">
                  Within 40 miles of Oakland
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                    +$50 Service Fee
                  </span>
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                    50% Deposit Required
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`
                absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-200
                ${
                  serviceType === "mobile"
                    ? "border-primary-light dark:border-orange-500 bg-primary-light dark:bg-orange-500"
                    : "border-border-DEFAULT dark:border-stone-600"
                }
              `}
            >
              {serviceType === "mobile" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-full h-full rounded-full bg-white dark:bg-white flex items-center justify-center"
                >
                  <div className="w-3 h-3 rounded-full bg-primary-light dark:bg-orange-500" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Information */}
      {serviceType === "mobile" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-5 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm"
        >
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium text-base">Mobile Service Details:</p>
              <ul className="mt-3 space-y-3 list-disc list-inside">
                <li>Address validation required before booking</li>
                <li>50% deposit charged at booking confirmation</li>
                <li>Remaining balance due at service completion</li>
                <li>
                  Cancellations must be made 24+ hours in advance to avoid
                  deposit forfeiture
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ServiceTypeToggle;
