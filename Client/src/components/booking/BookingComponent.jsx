import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { services } from "../../constants";
import ServiceList from "./ServiceList";
import BookingForm from "./BookingForm";
import Confirmation from "./Confirmation";
//import OptionToggle from "./OptionToggle";
import VehicleTypeSelector from "./VehicleTypeSelector";
import OptionalServices from "./OptionalServices";
import { useBookingState } from "../../hooks/useBookingState";

const BookingComponent = () => {
  const {
    bookingStep,
    //activeOption,
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
    //handleOptionToggle,
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

  // Scroll to top of booking component whenever step changes
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
            {/* <OptionToggle
              activeOption={activeOption}
              setActiveOption={handleOptionToggle}
            /> */}
            <VehicleTypeSelector
              selectedType={selectedVehicleType}
              onTypeChange={handleVehicleTypeChange}
            />
            <ServiceList
              //changed from activeOption as it will not be implemented at this stage
              services={services["drive-in"]}
              selectedService={selectedService}
              selectedScent={selectedScent}
              onServiceSelect={setSelectedService}
              onScentSelect={setSelectedScent}
              selectedVehicleType={selectedVehicleType}
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
                  ? "Continue"
                  : "Select a package and scent to continue"}
              </motion.button>
            </div>
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
                Back to Addons
              </motion.button>
            </div>
          </>
        );
      case "confirmation":
        return <Confirmation booking={booking} />;
      default:
        return null;
    }
  };

  return (
    <div id="booking-component" className="card max-w-[1000px] mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold">
          {bookingStep === "options"
            ? "Enhance Your Service"
            : "Choose Your Service Type"}
        </h2>
        <p className="text-neutral-400 mt-2">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            renderStepContent()
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default BookingComponent;
