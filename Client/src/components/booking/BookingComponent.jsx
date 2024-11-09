import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { services } from "../../constants";
import ServiceList from "./ServiceList";
import BookingForm from "./BookingForm";
import Confirmation from "./Confirmation";
import OptionToggle from "./OptionToggle";
import { useBookingState } from "../../hooks/useBookingState";

const BookingComponent = () => {
  const {
    bookingStep,
    activeOption,
    selectedService,
    selectedScent,
    bookingDetails,
    captcha,
    handleOptionToggle,
    handleNext,
    handleBack,
    setSelectedService,
    setSelectedScent,
    handleInputChange,
    handleBookingSubmit,
    canProceedToDetails,
    isFormValid,
  } = useBookingState();

  // Scroll to top of booking component whenever step changes
  useEffect(() => {
    if (bookingStep === "details") {
      const element = document.getElementById("booking-component");
      if (element) {
        const yOffset = -80; // Adjust this value based on your header height
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, [bookingStep]);

  const renderStepContent = () => {
    switch (bookingStep) {
      case "service":
        return (
          <>
            <OptionToggle
              activeOption={activeOption}
              setActiveOption={handleOptionToggle}
            />
            <ServiceList
              services={services[activeOption]}
              selectedService={selectedService}
              selectedScent={selectedScent}
              onServiceSelect={setSelectedService}
              onScentSelect={setSelectedScent}
            />
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800">
              <motion.button
                onClick={handleNext}
                className={`w-full p-3 rounded-lg transition-colors duration-200 ${
                  canProceedToDetails
                    ? "bg-primary-color text-white hover:bg-opacity-90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={canProceedToDetails ? { scale: 1.05 } : {}}
                whileTap={canProceedToDetails ? { scale: 0.95 } : {}}
                disabled={!canProceedToDetails}
              >
                {canProceedToDetails
                  ? "Proceed to Booking"
                  : "Select a package and scent to continue"}
              </motion.button>
            </div>
          </>
        );
      case "details":
        return (
          <>
            <BookingForm
              bookingDetails={bookingDetails}
              onInputChange={handleInputChange}
              captcha={captcha}
              onSubmit={handleBookingSubmit}
              isFormValid={isFormValid}
            />
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800">
              <motion.button
                onClick={handleBack}
                className="w-full p-3 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Services
              </motion.button>
            </div>
          </>
        );
      case "confirmation":
        return <Confirmation />;
      default:
        return null;
    }
  };

  return (
    <div id="booking-component" className="card max-w-[1000px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Choose Your Service Type
        </h2>
        <p className="text-neutral-400 mt-2">
          Select the service option that best fits your schedule
        </p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={bookingStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="pb-24" // Add padding to bottom to account for sticky button
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BookingComponent;
