import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ServiceList from "./ServiceList";
import BookingForm from "./BookingForm";
import Confirmation from "./Confirmation";
import VehicleTypeSelector from "./VehicleTypeSelector";
import OptionalServices from "./OptionalServices";
import { useBookingState } from "../../hooks/useBookingState";

const BookingComponent = () => {
  const {
    bookingStep,
    selectedVehicleType,
    selectedService,
    selectedScent,
    selectedOptions,
    bookingDetails,
    booking,
    captcha,
    loading,
    error,
    optionalServicesData,
    handleVehicleTypeChange,
    handleNext,
    handleBack,
    setSelectedService,
    setSelectedScent,
    handleOptionSelect,
    handleInputChange,
    handleBookingSubmit,
    canProceedToDetails,
    isFormValid,
  } = useBookingState();

  useEffect(() => {
    if (
      bookingStep === "details" ||
      bookingStep === "options" ||
      bookingStep === "confirmation"
    ) {
      const element = document.getElementById("booking-component");
      if (element) {
        const yOffset = -80;
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
            <VehicleTypeSelector
              selectedType={selectedVehicleType}
              onTypeChange={handleVehicleTypeChange}
            />
            <ServiceList
              selectedService={selectedService}
              selectedScent={selectedScent}
              onServiceSelect={setSelectedService}
              onScentSelect={setSelectedScent}
              selectedVehicleType={selectedVehicleType}
            />
          </>
        );
      case "options":
        return (
          <>
            <OptionalServices
              optionalServices={optionalServicesData}
              selectedOptions={selectedOptions}
              onOptionSelect={handleOptionSelect}
              onContinue={handleNext}
              onBack={handleBack}
            />
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
              onBack={handleBack} // Make sure this is correctly passed
            />
          </>
        );
      case "confirmation":
        return <Confirmation booking={booking} />;
      default:
        return null;
    }
  };

  const renderStepButtons = () => {
    if (bookingStep === "confirmation") return null;

    return (
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-stone-900/95 backdrop-blur-sm border-t border-border-light dark:border-stone-700">
        {bookingStep === "service" && (
          <motion.button
            onClick={handleNext}
            className={`w-full p-3 rounded-lg transition-colors duration-200 ${
              canProceedToDetails
                ? "bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600"
                : "bg-background-dark dark:bg-stone-800 text-content-light dark:text-stone-500 cursor-not-allowed"
            }`}
            whileHover={canProceedToDetails ? { scale: 1.02 } : {}}
            whileTap={canProceedToDetails ? { scale: 0.98 } : {}}
            disabled={!canProceedToDetails}
          >
            {canProceedToDetails
              ? "Continue"
              : "Select a package and scent to continue"}
          </motion.button>
        )}
      </div>
    );
  };

  return (
    <div id="booking-component" className="max-w-[1000px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-dark dark:text-white">
          {bookingStep === "options"
            ? "Enhance Your Service"
            : "Choose Your Service Type"}
        </h2>
        <p className="text-content-light dark:text-stone-400 mt-2">
          {bookingStep === "options"
            ? "Add optional services to customize your experience"
            : "Select the service option that best fits your schedule"}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={bookingStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border-border-DEFAULT dark:border-stone-700 bg-background-light dark:bg-stone-800 overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
            </div>
          ) : (
            renderStepContent()
          )}
        </motion.div>
      </AnimatePresence>

      {renderStepButtons()}
      
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BookingComponent;
