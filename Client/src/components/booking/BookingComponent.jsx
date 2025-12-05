import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ServiceList from "./ServiceList";
import BookingForm from "./BookingForm";
import Confirmation from "./Confirmation";
import VehicleTypeSelector from "./VehicleTypeSelector";
import OptionalServices from "./OptionalServices";
import ServiceTypeToggle from "./ServiceTypeToggle"; // NEW: Import mobile service component
import AddressInput from "./AddressInput"; // NEW: Import address input component
import MobileDetails from "./MobileDetails"; // NEW: Import mobile payment component
import { useBookingState } from "../../hooks/useBookingState";

const BookingComponent = () => {
  const {
    // Existing state
    bookingStep,
    selectedVehicleType,
    selectedService,
    selectedScent,
    selectedOptions,
    optionQuantities,
    bookingDetails,
    booking,
    captcha,
    loading,
    error,
    optionalServicesData,
    canProceedToDetails,
    baseServicePrice,

    // NEW: Mobile service state
    serviceType,
    customerAddress,
    addressValidation,
    canProceedFromServiceType,

    // Existing handlers
    handleVehicleTypeChange,
    handleNext,
    handleBack,
    setSelectedService,
    setSelectedScent,
    handleOptionSelect,
    handleOptionQuantityChange,
    handleInputChange,
    handleBookingSubmit,

    // NEW: Mobile service handlers
    handleServiceTypeChange,
    handleAddressChange,
    validateAddress,

    // NEW: Payment step state and handlers
    finalizeMobileBooking,
    mobileDetails,
    totalPrice,

    // Mobile detailing toggle
    mobileDetailingEnabled,
  } = useBookingState();

  // Track previous step to handle scroll transitions
  const previousStep = useRef(bookingStep);

  // Reference to the booking form for submission
  const bookingFormRef = useRef(null);

  useEffect(() => {
    // Only scroll if the step has actually changed
    if (previousStep.current !== bookingStep) {
      const element = document.getElementById("booking-component");
      if (element) {
        const yOffset = -80;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      // Update the previous step
      previousStep.current = bookingStep;
    }
  }, [bookingStep]);

  const renderStepContent = () => {
    switch (bookingStep) {
      // NEW: Service Type Selection Step
      case "service-type":
        return (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <ServiceTypeToggle
                serviceType={serviceType}
                onServiceTypeChange={handleServiceTypeChange}
              />
              {serviceType === "mobile" && (
                <AddressInput
                  address={customerAddress}
                  onAddressChange={handleAddressChange}
                  onValidateAddress={validateAddress}
                  validationStatus={addressValidation}
                />
              )}
            </div>
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
              optionQuantities={optionQuantities}
              onQuantityChange={handleOptionQuantityChange}
              onOptionSelect={handleOptionSelect}
              serviceType={serviceType} // NEW: Pass service type for pricing
              selectedServicePrice={baseServicePrice} // NEW: Pass base service price for breakdown
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
              serviceType={serviceType} // NEW: Pass service type
              customerAddress={customerAddress} // NEW: Pass address for mobile service
              addressValidation={addressValidation} // NEW: Pass validation status
              onAddressChange={handleAddressChange} // NEW: Pass address change handler
              onValidateAddress={validateAddress} // NEW: Pass address validation handler
              formRef={bookingFormRef}
            />
          </>
        );
      case "payment":
        return (
          <MobileDetails
            bookingDetails={bookingDetails}
            totalPrice={totalPrice}
            mobileDetails={mobileDetails}
            finalizeMobileBooking={finalizeMobileBooking}
            onBack={handleBack}
          />
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
      <div className="sticky bottom-0 left-0 right-0 px-2 pt-8 pb-3 sm:px-3 sm:pt-10 sm:pb-4 bg-white dark:bg-stone-900 backdrop-blur-md border-t border-stone-200/50 dark:border-stone-700/50 z-50">
        {/* Improved responsive button layout */}
        {bookingStep === "service-type" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full px-1 sm:px-0">
            <motion.button
              onClick={handleNext}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl sm:rounded-lg text-base font-semibold transition-all duration-200 ${
                canProceedFromServiceType
                  ? "bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600 shadow-sm hover:shadow-md"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed"
              }`}
              whileHover={canProceedFromServiceType ? { scale: 1.015 } : {}}
              whileTap={canProceedFromServiceType ? { scale: 0.98 } : {}}
              disabled={!canProceedFromServiceType}
              style={{
                minHeight: 48,
                letterSpacing: 0.02,
              }}
            >
              {serviceType === "mobile" &&
              (!addressValidation || addressValidation.status !== "valid")
                ? "Please enter a valid address to continue"
                : "Continue to Services"}
            </motion.button>
          </div>
        )}

        {bookingStep === "service" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full px-1 sm:px-0">
            {/* Only show back button if mobile detailing is enabled */}
            {mobileDetailingEnabled && (
              <motion.button
                onClick={handleBack}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl sm:rounded-lg text-base font-semibold bg-white dark:bg-stone-800 text-stone-700 dark:text-white border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-200 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  minHeight: 48,
                  letterSpacing: 0.02,
                }}
              >
                Back to Service Type
              </motion.button>
            )}
            <motion.button
              onClick={handleNext}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl sm:rounded-lg text-base font-semibold transition-all duration-200 ${
                canProceedToDetails
                  ? "bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600 shadow-sm hover:shadow-md"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed"
              }`}
              whileHover={canProceedToDetails ? { scale: 1.015 } : {}}
              whileTap={canProceedToDetails ? { scale: 0.98 } : {}}
              disabled={!canProceedToDetails}
              style={{
                minHeight: 48,
                letterSpacing: 0.02,
              }}
            >
              {canProceedToDetails
                ? "Continue to Add-ons"
                : "Select a package and scent to continue"}
            </motion.button>
          </div>
        )}

        {bookingStep === "options" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full px-1 sm:px-0">
            <motion.button
              onClick={handleBack}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl sm:rounded-lg text-base font-semibold bg-white dark:bg-stone-800 text-stone-700 dark:text-white border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-200 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              style={{
                minHeight: 48,
                letterSpacing: 0.02,
              }}
            >
              Back to Services
            </motion.button>
            <motion.button
              onClick={handleNext}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl sm:rounded-lg text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              style={{
                minHeight: 48,
                letterSpacing: 0.02,
              }}
            >
              Continue to Booking Details
            </motion.button>
          </div>
        )}

        {bookingStep === "details" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full px-1 sm:px-0">
            <motion.button
              onClick={handleBack}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl sm:rounded-lg text-base font-semibold bg-white dark:bg-stone-800 text-stone-700 dark:text-white border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-200 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              style={{
                minHeight: 48,
                letterSpacing: 0.02,
              }}
            >
              Back to Add-ons
            </motion.button>
            <motion.button
              onClick={() => {
                // Trigger form submission via ref
                if (bookingFormRef.current) {
                  bookingFormRef.current.requestSubmit();
                }
              }}
              disabled={
                loading ||
                (serviceType === 'mobile' &&
                  (!addressValidation || addressValidation.status !== 'valid'))
              }
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl sm:rounded-lg text-base font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
                !loading &&
                (serviceType === 'drive-in' ||
                  (serviceType === 'mobile' &&
                    addressValidation?.status === 'valid'))
                  ? 'bg-primary-light dark:bg-orange-500 text-white hover:bg-primary-DEFAULT dark:hover:bg-orange-600'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
              }`}
              whileHover={
                !loading &&
                (serviceType === 'drive-in' ||
                  (serviceType === 'mobile' &&
                    addressValidation?.status === 'valid'))
                  ? { scale: 1.015 }
                  : {}
              }
              whileTap={
                !loading &&
                (serviceType === 'drive-in' ||
                  (serviceType === 'mobile' &&
                    addressValidation?.status === 'valid'))
                  ? { scale: 0.98 }
                  : {}
              }
              style={{
                minHeight: 48,
                letterSpacing: 0.02,
              }}
            >
              {serviceType === 'mobile'
                ? 'Complete Mobile Booking'
                : 'Complete Booking'}
            </motion.button>
          </div>
        )}
      </div>
    );
  };

  // Enhanced step titles and descriptions
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
          // Simplified description when mobile is disabled
          description: mobileDetailingEnabled
            ? `Choose the ${serviceType === "mobile" ? "mobile " : ""}service that best fits your needs`
            : "Choose the service that best fits your needs",
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
      case "payment":
        return {
          title: "Mobile Service Deposit",
          description: "Secure your booking with a 50% deposit payment",
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

        {/* Service type indicator - only show when mobile detailing is enabled */}
        {mobileDetailingEnabled && bookingStep !== "service-type" && bookingStep !== "confirmation" && (
          <div className="mt-4 flex justify-center">
            <div
              className={`
              px-4 py-1.5 rounded-lg text-sm font-medium border backdrop-blur-sm
              ${
                serviceType === "mobile"
                  ? "bg-orange-50/50 dark:bg-orange-900/10 text-orange-800 dark:text-orange-300 border-orange-200/50 dark:border-orange-800/30"
                  : "bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30"
              }
            `}
            >
              {serviceType === "mobile"
                ? "Mobile Service (+$50)"
                : "Drive-In Service"}
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
          className="rounded-lg"
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
