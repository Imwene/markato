import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ServiceList from "./ServiceList";
import BookingForm from "./BookingForm";
import Confirmation from "./Confirmation";
import VehicleTypeSelector from "./VehicleTypeSelector";
import OptionalServices from "./OptionalServices";
import ServiceTypeToggle from "./ServiceTypeToggle"; // NEW: Import mobile service component
import AddressInput from "./AddressInput"; // NEW: Import address input component
import { useBookingState } from "../../hooks/useBookingState";

const BookingComponent = () => {
  const {
    // Existing state
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
    canProceedToDetails,
    isFormValid,

    // NEW: Mobile service state
    serviceType,
    customerAddress,
    addressValidation,
    isValidatingAddress,
    canProceedFromServiceType,

    // Existing handlers
    handleVehicleTypeChange,
    handleNext,
    handleBack,
    setSelectedService,
    setSelectedScent,
    setSelectedOptions: handleOptionSelect,
    handleInputChange,
    handleBookingSubmit,

    // NEW: Mobile service handlers
    handleServiceTypeChange,
    handleAddressChange,
    validateAddress,
  } = useBookingState();

  useEffect(() => {
    if (
      bookingStep === "details" ||
      bookingStep === "options" ||
      bookingStep === "confirmation" ||
      bookingStep === "service-type" // NEW: Include service-type step
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
      // NEW: Service Type Selection Step
      case "service-type":
        return (
          <div className="p-6">
            <ServiceTypeToggle
              serviceType={serviceType}
              onServiceTypeChange={handleServiceTypeChange}
            />
            {serviceType === "mobile" && (
              <div className="mt-6">
                <AddressInput
                  address={customerAddress}
                  onAddressChange={handleAddressChange}
                  onValidateAddress={validateAddress}
                  validationStatus={addressValidation}
                />
              </div>
            )}
          </div>
        );

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
              serviceType={serviceType} // NEW: Pass service type for pricing
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
              serviceType={serviceType} // NEW: Pass service type for pricing
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
              onBack={handleBack}
              serviceType={serviceType} // NEW: Pass service type
              customerAddress={customerAddress} // NEW: Pass address for mobile service
              addressValidation={addressValidation} // NEW: Pass validation status
            />
          </>
        );
      case "confirmation":
        return (
          <Confirmation
            booking={booking}
            serviceType={serviceType} // NEW: Pass service type for display
          />
        );
      default:
        return null;
    }
  };

  const renderStepButtons = () => {
    if (bookingStep === "confirmation") return null;

    return (
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-stone-900/95 backdrop-blur-sm border-t border-border-light dark:border-stone-700">
        {/* NEW: Service Type Step Button */}
        {bookingStep === "service-type" && (
          <div className="flex gap-3">
            <motion.button
              onClick={handleNext}
              className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                canProceedFromServiceType
                  ? "bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600"
                  : "bg-background-dark dark:bg-stone-800 text-content-light dark:text-stone-500 cursor-not-allowed"
              }`}
              whileHover={canProceedFromServiceType ? { scale: 1.02 } : {}}
              whileTap={canProceedFromServiceType ? { scale: 0.98 } : {}}
              disabled={!canProceedFromServiceType}
            >
              {serviceType === "mobile" &&
              (!addressValidation || addressValidation.status !== "valid")
                ? "Please enter a valid address to continue"
                : "Continue to Services"}
            </motion.button>
          </div>
        )}

        {bookingStep === "service" && (
          <div className="flex gap-3">
            <motion.button
              onClick={handleBack}
              className="flex-1 p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 text-content-DEFAULT dark:text-white border border-border-DEFAULT dark:border-stone-700 hover:bg-background-dark dark:hover:bg-stone-700 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Service Type
            </motion.button>
            <motion.button
              onClick={handleNext}
              className={`flex-1 p-3 rounded-lg transition-colors duration-200 ${
                canProceedToDetails
                  ? "bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600"
                  : "bg-background-dark dark:bg-stone-800 text-content-light dark:text-stone-500 cursor-not-allowed"
              }`}
              whileHover={canProceedToDetails ? { scale: 1.02 } : {}}
              whileTap={canProceedToDetails ? { scale: 0.98 } : {}}
              disabled={!canProceedToDetails}
            >
              {canProceedToDetails
                ? "Continue to Add-ons"
                : "Select a package and scent to continue"}
            </motion.button>
          </div>
        )}
      </div>
    );
  };

  // NEW: Enhanced step titles and descriptions
  const getStepInfo = () => {
    switch (bookingStep) {
      case "service-type":
        return {
          title: "Choose Your Service Type",
          description:
            "Select whether you'd like to visit our location or have us come to you",
        };
      case "service":
        return {
          title: "Select Your Service Package",
          description: `Choose the ${
            serviceType === "mobile" ? "mobile " : ""
          }service that best fits your needs`,
        };
      case "options":
        return {
          title: "Enhance Your Service",
          description: "Add optional services to customize your experience",
        };
      case "details":
        return {
          title: "Complete Your Booking",
          description:
            serviceType === "mobile"
              ? "Fill in your details to schedule your mobile service"
              : "Fill in your details to schedule your appointment",
        };
      case "confirmation":
        return {
          title: "Booking Confirmed",
          description:
            serviceType === "mobile"
              ? "Your mobile service has been scheduled"
              : "Your appointment has been scheduled",
        };
      default:
        return {
          title: "Book Your Service",
          description: "Let's get your vehicle detailed",
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div id="booking-component" className="max-w-[1000px] mx-auto">
      {/* NEW: Enhanced header with step info */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-content-dark dark:text-white">
          {stepInfo.title}
        </h2>
        <p className="text-content-light dark:text-stone-400 mt-2">
          {stepInfo.description}
        </p>

        {/* NEW: Service type indicator */}
        {bookingStep !== "service-type" && bookingStep !== "confirmation" && (
          <div className="mt-4 flex justify-center">
            <div
              className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${
                serviceType === "mobile"
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              }
            `}
            >
              {serviceType === "mobile"
                ? "📱 Mobile Service (+$50)"
                : "🏢 Drive-In Service"}
            </div>
          </div>
        )}
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
