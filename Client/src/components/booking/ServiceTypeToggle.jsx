import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MapPin, Car, CheckCircle2 } from "lucide-react";
import PropTypes from "prop-types";

// Service configuration data
const SERVICE_OPTIONS = [
  {
    id: "drive-in",
    title: "Drive-In Service",
    description: "Visit our location for professional service",
    icon: Car,
    location: "1901 Park Blvd, Oakland, CA",
    badge: {
      text: "No Additional Fee",
      color: "green",
    },
  },
  {
    id: "mobile",
    title: "Mobile Service",
    description: "We bring our expertise to your location",
    icon: MapPin,
    location: "East Bay Area • Within 15 miles",
    badge: {
      text: "+$50 Service Fee",
      color: "orange",
    },
  },
];

// Helper function for badge styling
const getBadgeClasses = (color) => {
  const colors = {
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  };
  return colors[color] || colors.green;
};

// ServiceOptionCard component
const ServiceOptionCard = ({
  option,
  isSelected,
  onSelect,
  shouldReduceMotion,
}) => {
  const Icon = option.icon;

  // Animation variants
  const cardVariants = shouldReduceMotion
    ? {}
    : {
        hover: { scale: 1.02, y: -2 },
        tap: { scale: 0.98 },
      };

  const iconVariants = shouldReduceMotion
    ? {}
    : {
        initial: { scale: 0, rotate: -180 },
        animate: { scale: 1, rotate: 0 },
      };

  const borderVariants = shouldReduceMotion
    ? {}
    : {
        initial: { scaleX: 0 },
        animate: { scaleX: 1 },
      };

  // Handle keyboard interaction
  const handleKeyDown = (e) => {
    // Support multiple space key variants for better browser compatibility
    if (
      e.key === "Enter" ||
      e.key === " " ||
      e.key === "Space" ||
      e.key === "Spacebar"
    ) {
      e.preventDefault();
      onSelect(option.id);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      role="radio"
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onKeyDown={handleKeyDown}
      onClick={() => onSelect(option.id)}
      className={`
        relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light/30 dark:focus-visible:ring-orange-500/30
        ${
          isSelected
            ? "border-primary-light/60 dark:border-orange-500/60 shadow-sm"
            : "border-border-DEFAULT/60 dark:border-stone-700/60 shadow-sm hover:border-primary-light/40 dark:hover:border-orange-500/40"
        }
      `}
    >
      {/* Background overlay */}
      <div
        aria-hidden="true"
        className={`
          absolute inset-0 transition-opacity duration-300
          ${
            isSelected
              ? "bg-white/50 dark:bg-stone-800/80 opacity-100"
              : "bg-white/80 dark:bg-stone-800/60 opacity-100"
          }
        `}
      />

      {/* Content */}
      <div className="relative p-5 lg:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            aria-hidden="true"
            className={`
              flex-shrink-0 p-2.5 rounded-xl transition-all duration-300
              ${
                isSelected
                  ? "bg-primary-light/10 dark:bg-orange-500/15 text-primary-light dark:text-orange-400 border border-primary-light/20 dark:border-orange-500/30"
                  : "bg-stone-100 dark:bg-stone-700/50 text-content-light dark:text-stone-400"
              }
            `}
          >
            <Icon size={24} strokeWidth={2.5} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4
                className={`
                  text-xl font-bold transition-colors duration-200
                  ${
                    isSelected
                      ? "text-content-dark dark:text-white"
                      : "text-content-dark dark:text-white"
                  }
                `}
              >
                {option.title}
              </h4>

              {/* Selection indicator */}
              <div className="flex-shrink-0" aria-hidden="true">
                {isSelected ? (
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2
                      size={24}
                      className="text-primary-light dark:text-orange-500"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-border-DEFAULT dark:border-stone-600" />
                )}
              </div>
            </div>

            <p className="text-sm text-content-light dark:text-stone-400 mb-3">
              {option.description}
            </p>

            {/* Location info */}
            <div className="flex items-start gap-2 mb-3">
              <MapPin
                size={16}
                className="text-content-light dark:text-stone-400 mt-0.5 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-content-DEFAULT dark:text-stone-300">
                {option.location}
              </span>
            </div>

            {/* Badge */}
            <div className="inline-flex">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getBadgeClasses(
                  option.badge.color
                )}`}
              >
                {option.badge.color === "green" && (
                  <CheckCircle2 size={14} aria-hidden="true" />
                )}
                {option.badge.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected border accent - subtle left accent */}
      {isSelected && (
        <motion.div
          variants={borderVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3 }}
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-light to-primary-dark dark:from-orange-500 dark:to-orange-600"
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
};

// PropTypes for ServiceOptionCard
ServiceOptionCard.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    location: PropTypes.string.isRequired,
    badge: PropTypes.shape({
      text: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  shouldReduceMotion: PropTypes.bool,
};

const ServiceTypeToggle = ({ serviceType, onServiceTypeChange }) => {
  const shouldReduceMotion = useReducedMotion();

  // Handle arrow key navigation for radio group
  const handleRadioGroupKeyDown = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = SERVICE_OPTIONS.findIndex(
        (opt) => opt.id === serviceType
      );
      const prevIndex =
        currentIndex === 0 ? SERVICE_OPTIONS.length - 1 : currentIndex - 1;
      onServiceTypeChange(SERVICE_OPTIONS[prevIndex].id);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const currentIndex = SERVICE_OPTIONS.findIndex(
        (opt) => opt.id === serviceType
      );
      const nextIndex =
        currentIndex === SERVICE_OPTIONS.length - 1 ? 0 : currentIndex + 1;
      onServiceTypeChange(SERVICE_OPTIONS[nextIndex].id);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div
        role="radiogroup"
        aria-label="Choose your service type"
        onKeyDown={handleRadioGroupKeyDown}
        className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0"
      >
        {SERVICE_OPTIONS.map((option) => (
          <ServiceOptionCard
            key={option.id}
            option={option}
            isSelected={serviceType === option.id}
            onSelect={onServiceTypeChange}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </div>

      {/* Additional Information - Smooth collapse/expand without reserved space */}
      <AnimatePresence initial={false}>
        {serviceType === "mobile" && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={
              shouldReduceMotion ? false : { opacity: 1, height: "auto" }
            }
            exit={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: "easeInOut" }
            }
            className="overflow-hidden"
          >
            <div className="p-4 lg:p-5 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md"
                  aria-hidden="true"
                >
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
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Important: 50% deposit required • 24-hour cancellation
                    notice required
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// PropTypes for ServiceTypeToggle
ServiceTypeToggle.propTypes = {
  serviceType: PropTypes.string.isRequired,
  onServiceTypeChange: PropTypes.func.isRequired,
};

export default ServiceTypeToggle;
