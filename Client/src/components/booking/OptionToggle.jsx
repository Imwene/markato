import React from "react";
import { motion } from "framer-motion";
import { Car, Calendar } from "lucide-react";

const OptionToggle = ({ activeOption, setActiveOption }) => {
  const options = [
    {
      id: "drive-in",
      label: "Drive-in Service",
      description: "Quick service, no appointment needed",
      icon: <Car className="w-5 h-5" />,
    },
    {
      id: "appointment",
      label: "Book Appointment",
      description: "Schedule a detailed service",
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {options.map((option) => (
        <motion.button
          key={option.id}
          onClick={() => setActiveOption(option.id)}
          className={`
            relative flex-1 p-4 rounded-xl border-2 transition-colors duration-200
            ${
              activeOption === option.id
                ? "border-orange-500 bg-neutral-800"
                : "border-neutral-700 bg-neutral-900 hover:border-neutral-600"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`
                p-2 rounded-lg
                ${
                  activeOption === option.id
                    ? "bg-orange-500 text-white"
                    : "bg-neutral-700 text-neutral-400"
                }
              `}
            >
              {option.icon}
            </div>
            <div className="text-left">
              <h3
                className={`font-medium ${
                  activeOption === option.id ? "text-white" : "text-neutral-300"
                }`}
              >
                {option.label}
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                {option.description}
              </p>
            </div>
          </div>

          {/* Active indicator dot */}
          {activeOption === option.id && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default OptionToggle;
