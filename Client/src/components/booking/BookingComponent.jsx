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
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 backdrop-blur-sm border-t border-border-light">
        {bookingStep === "service" && (
          <motion.button
            onClick={handleNext}
            className={`w-full p-3 rounded-lg transition-colors duration-200 ${
              canProceedToDetails
                ? "bg-primary-light text-white hover:bg-primary-DEFAULT"
                : "bg-background-dark text-content-light cursor-not-allowed"
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

        {/* {bookingStep === "options" && (
          <div className="space-y-3">
            <motion.button
              onClick={handleNext}
              className="w-full p-3 rounded-lg bg-primary-light text-white hover:bg-primary-DEFAULT transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue to Booking Details
            </motion.button>
            <motion.button
              onClick={handleBack}
              className="w-full p-3 rounded-lg bg-background-DEFAULT text-content-DEFAULT border border-border-DEFAULT hover:bg-background-dark transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Services
            </motion.button>
          </div>
        )} */}

        {/* {bookingStep === "details" && (
          <div className="space-y-3">
            <motion.button
              onClick={handleBookingSubmit}
              className={`w-full p-3 rounded-lg transition-colors duration-200 ${
                isFormValid
                  ? "bg-primary-light text-white hover:bg-primary-DEFAULT"
                  : "bg-background-dark text-content-light cursor-not-allowed"
              }`}
              whileHover={isFormValid ? { scale: 1.02 } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
              disabled={!isFormValid}
            >
              Complete Booking
            </motion.button>
            <motion.button
              onClick={handleBack}
              className="w-full p-3 rounded-lg bg-background-DEFAULT text-content-DEFAULT border border-border-DEFAULT hover:bg-background-dark transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Addons
            </motion.button>
          </div>
        )} */}
      </div>
    );
  };

  return (
    <div id="booking-component" className="card max-w-[1000px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-dark">
          {bookingStep === "options"
            ? "Enhance Your Service"
            : "Choose Your Service Type"}
        </h2>
        <p className="text-content-light mt-2">
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
          className="pb-24"
        >
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
            </div>
          ) : (
            renderStepContent()
          )}
        </motion.div>
      </AnimatePresence>
      {renderStepButtons()}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default BookingComponent;
