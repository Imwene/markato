import { useState, useEffect, useMemo, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config";
import { useServices } from "../../../hooks/useServices";
import { useConfig } from "../../../hooks/useConfig";
import {
  formatToPacificDate,
  formatToPacificDateTime,
} from "../../../utils/dateUtils";
import PropTypes from "prop-types";

const BUSINESS_HOURS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const UNLISTED_SERVICES = {
  interior: {
    id: "custom_interior",
    name: "Interior Only",
    pricing: {
      "sedan": [30, 50],
      "mini-suv": [40, 70],
      "suv": [50, 80],
      "van/truck": [50, 80],
    },
  },
  exterior: {
    id: "custom_exterior",
    name: "Exterior Only",
    pricing: {
      "sedan": [25, 40],
      "mini-suv": [35, 50],
      "suv": [40, 45, 60],
      "van/truck": [40, 45, 60],
    },
  },
};

const ExpressBooking = ({ customer, onClose, onSuccess }) => {
  const { services, loading: servicesLoading } = useServices();
  const { vehicleTypes, optionalServices, scents, loading: configLoading } = useConfig();
  const [timeSlots, setTimeSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [bookingData, setBookingData] = useState({
    name: customer.name || "",
    contact: customer.phone,
    email: customer.email || "",
    vehicleType: customer.preferences?.defaultVehicleType || vehicleTypes[0]?.id || "",
    makeModel: customer.preferences?.defaultVehicle || "",
    serviceId: customer.preferences?.defaultService || "",
    selectedScent: customer.preferences?.defaultScent || "",
    time: customer.preferences?.preferredTime || "",
    optionalServices: [],
    selectedPrice: "",
    totalPrice: 0,
    customerId: customer._id
  });

  // Smart pre-filling based on customer history
  useEffect(() => {
    if (customer.bookingHistory && customer.bookingHistory.length > 0) {
      const recentBookings = customer.bookingHistory.slice(-3); // Last 3 bookings
      
      // Find most common vehicle type
      const vehicleTypeCounts = {};
      recentBookings.forEach(booking => {
        if (booking.vehicleType) {
          vehicleTypeCounts[booking.vehicleType] = (vehicleTypeCounts[booking.vehicleType] || 0) + 1;
        }
      });
      const mostCommonVehicleType = Object.keys(vehicleTypeCounts).reduce((a, b) => 
        vehicleTypeCounts[a] > vehicleTypeCounts[b] ? a : b, null
      );

      // Find most common service
      const serviceCounts = {};
      recentBookings.forEach(booking => {
        if (booking.serviceId) {
          serviceCounts[booking.serviceId] = (serviceCounts[booking.serviceId] || 0) + 1;
        }
      });
      const mostCommonService = Object.keys(serviceCounts).reduce((a, b) => 
        serviceCounts[a] > serviceCounts[b] ? a : b, null
      );

      // Find most common scent
      const scentCounts = {};
      recentBookings.forEach(booking => {
        if (booking.selectedScent) {
          scentCounts[booking.selectedScent] = (scentCounts[booking.selectedScent] || 0) + 1;
        }
      });
      const mostCommonScent = Object.keys(scentCounts).reduce((a, b) => 
        scentCounts[a] > scentCounts[b] ? a : b, null
      );

      // Find most common time slot
      const timeCounts = {};
      recentBookings.forEach(booking => {
        if (booking.dateTime) {
          const bookingTime = new Date(booking.dateTime).toLocaleTimeString(
            "en-US",
            { hour: "numeric", minute: "2-digit", hour12: true }
          );
          timeCounts[bookingTime] = (timeCounts[bookingTime] || 0) + 1;
        }
      });
      const mostCommonTime = Object.keys(timeCounts).reduce((a, b) => 
        timeCounts[a] > timeCounts[b] ? a : b, null
      );

      // Get most recent vehicle make/model
      const mostRecentVehicle = recentBookings
        .filter(booking => booking.makeModel)
        .pop()?.makeModel;

      // Update booking data with intelligent defaults
      setBookingData(prev => ({
        ...prev,
        vehicleType: prev.vehicleType || mostCommonVehicleType || vehicleTypes[0]?.id || "",
        makeModel: prev.makeModel || mostRecentVehicle || "",
        serviceId: prev.serviceId || mostCommonService || "",
        selectedScent: prev.selectedScent || mostCommonScent || "",
        time: prev.time || mostCommonTime || "",
      }));
    }
  }, [customer.bookingHistory, vehicleTypes]);

  const [optionalQuantities, setOptionalQuantities] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);



  const businessHours = BUSINESS_HOURS;

  const fetchTimeSlotBookings = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await api.get(
        `${
          CONFIG.ENDPOINTS.ADMIN.BOOKINGS.WEEKLY
        }?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (response.success) {
        const slotCounts = {};
        businessHours.forEach((time) => {
          slotCounts[time] = {
            count: response.data.filter((booking) => {
              const bookingTime = new Date(booking.dateTime).toLocaleTimeString(
                "en-US",
                { hour: "numeric", minute: "2-digit", hour12: true }
              );
              return bookingTime === time;
            }).length,
          };
        });
        setTimeSlots(slotCounts);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load time slot information");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, businessHours]);

  useEffect(() => {
    fetchTimeSlotBookings();
  }, [fetchTimeSlotBookings]);

  const isCustomService = bookingData.serviceId.startsWith("custom_");
  const customServiceType = isCustomService
    ? bookingData.serviceId.split("_")[1]
    : null;
  const priceOptions = useMemo(() => {
    if (!isCustomService || !customServiceType) return [];
    return (
      UNLISTED_SERVICES[customServiceType]?.pricing[bookingData.vehicleType] || []
    );
  }, [isCustomService, customServiceType, bookingData.vehicleType]);

  useEffect(() => {
    if (isCustomService) {
      if (priceOptions.length === 1) {
        setBookingData((prev) => ({ ...prev, selectedPrice: priceOptions[0] }));
      } else if (
        priceOptions.length > 1 &&
        !priceOptions.includes(Number(bookingData.selectedPrice))
      ) {
        setBookingData((prev) => ({ ...prev, selectedPrice: "" }));
      }
    }
  }, [isCustomService, priceOptions, bookingData.selectedPrice]);

  useEffect(() => {
    const calculatePrice = async () => {
      if (!bookingData.serviceId || !bookingData.vehicleType) {
        return;
      }

      try {
        let basePrice = 0;
        
        if (isCustomService) {
          basePrice = Number(bookingData.selectedPrice) || 0;
        } else {
          const service = services.find((s) => s._id === bookingData.serviceId);
          if (!service || !service.vehiclePricing) return;
          basePrice = service.vehiclePricing[bookingData.vehicleType] || 0;
        }

        const isSeatShampoo = (svc) => {
          return (
            svc?.name?.toLowerCase?.() === "seat cloth shampoo" || svc?.id === 4
          );
        };

        const optionalServicesTotal = bookingData.optionalServices.reduce(
          (total, service) => {
            if (isSeatShampoo(service)) {
              const qty = Math.max(
                1,
                Math.min(4, Number(optionalQuantities?.[service.serviceId]) || 1)
              );
              return total + (service?.price || 0) * qty;
            }
            return total + (service?.price || 0);
          },
          0
        );

        setBookingData((prev) => ({
          ...prev,
          servicePrice: basePrice,
          totalPrice: basePrice + optionalServicesTotal,
        }));
      } catch (error) {
        console.error("Error calculating price:", error);
      }
    };
    calculatePrice();
  }, [
    bookingData.serviceId,
    bookingData.vehicleType,
    bookingData.optionalServices,
    bookingData.selectedPrice,
    optionalQuantities,
    services,
    isCustomService,
  ]);



  const handleOptionalServiceToggle = (service) => {
    const serviceId = service.id.toString();
    setBookingData((prev) => {
      const isSelected = prev.optionalServices.some(
        (s) => s.serviceId.toString() === serviceId
      );

      const newOptionalServices = isSelected
        ? prev.optionalServices.filter(
            (s) => s.serviceId.toString() !== serviceId
          )
        : [
            ...prev.optionalServices,
            {
              serviceId: Number(service.id),
              name: service.name,
              price: Number(service.price),
            },
          ];

      // Maintain quantities only for selected options; default to 1 when newly selected
      setOptionalQuantities((prevQty) => {
        const next = { ...prevQty };
        if (isSelected) {
          delete next[serviceId];
        } else if (next[serviceId] == null) {
          next[serviceId] = 1;
        }
        return next;
      });

      return {
        ...prev,
        optionalServices: newOptionalServices,
      };
    });
  };

  const isSeatShampoo = (svc) =>
    svc?.name?.toLowerCase?.() === "seat cloth shampoo" || svc?.id === 4;
  const clampQty = (q) => Math.max(1, Math.min(4, Number(q) || 1));
  const handleQtyChange = (serviceId, q) => {
    setOptionalQuantities((prev) => ({ ...prev, [serviceId]: clampQty(q) }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };



  const validateForm = () => {
    const errors = {};

    if (!bookingData.makeModel?.trim())
      errors.makeModel = "Vehicle make/model is required";
    if (!bookingData.vehicleType) errors.vehicleType = "Vehicle type is required";
    if (!bookingData.serviceId) errors.serviceId = "Service is required";
    if (isCustomService && !bookingData.selectedPrice)
      errors.selectedPrice = "Price level is required";
    if (!bookingData.selectedScent)
      errors.selectedScent = "Scent selection is required";
    if (!bookingData.time) errors.time = "Time slot is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const currentCount = timeSlots[bookingData.time]?.count || 0;
      if (currentCount > 0) {
        const confirmOverbook = window.confirm(
          `There are already ${currentCount} booking(s) in this time slot. Do you want to proceed?`
        );
        if (!confirmOverbook) {
          setLoading(false);
          return;
        }
      }

      let servicePrice, serviceName, serviceId, features;
      if (isCustomService) {
        serviceId = bookingData.serviceId;
        serviceName = UNLISTED_SERVICES[customServiceType].name;
        servicePrice = Number(bookingData.selectedPrice);
        features = [];
      } else {
        const selectedService = services.find(
          (s) => s._id === bookingData.serviceId
        );
        if (!selectedService) throw new Error("Service not found");
        serviceId = selectedService._id;
        serviceName = selectedService.name;
        servicePrice = selectedService.vehiclePricing[bookingData.vehicleType];
        features = selectedService.features || [];
      }

      const selectedScentDetails = scents.find(
        (s) => s.id.toString() === bookingData.selectedScent.toString()
      );
      if (!selectedScentDetails) throw new Error("Selected scent not found");

      const selectedOptionalServices = bookingData.optionalServices.map(
        (service) => {
          const base = parseFloat(service.price);

          if (isSeatShampoo(service)) {
            const qty = Math.max(
              1,
              Math.min(4, Number(optionalQuantities?.[service.serviceId]) || 1)
            );
            return {
              serviceId: service.serviceId,
              name: `${service.name} (x${qty} seat${qty > 1 ? "s" : ""})`,
              price: base * qty,
            };
          }

          return {
            serviceId: service.serviceId,
            name: service.name,
            price: base,
          };
        }
      );

      const optionalServicesTotal = selectedOptionalServices.reduce(
        (sum, service) => sum + service.price,
        0
      );

      const totalPrice = servicePrice + optionalServicesTotal;

      const date = new Date();
      const dateStr = `${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}${date
        .getFullYear()
        .toString()}`;
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      const confirmationNumber = `BK-${dateStr}-${random}`;

      // Create date in Pacific Time to avoid UTC midnight becoming previous day
      const [year, month, day] = selectedDate.split('-').map(Number);
      const appointmentDate = new Date(year, month - 1, day);
      // Set to Pacific midnight to ensure correct date
      appointmentDate.setHours(0, 0, 0, 0);
      
      const dateTime = formatToPacificDateTime(appointmentDate, bookingData.time);

      const bookingPayload = {
        name: bookingData.name.trim(),
        contact: bookingData.contact.trim(),
        email: bookingData.email?.trim(),
        vehicleType: bookingData.vehicleType,
        makeModel: bookingData.makeModel.trim(),
        dateTime,
        serviceId,
        serviceName,
        selectedScent: selectedScentDetails.name,
        servicePrice,
        features,
        optionalServices: selectedOptionalServices,
        totalPrice,
        confirmationNumber,
        status: "pending",
      };

      const response = await api.post(
        CONFIG.ENDPOINTS.BOOKINGS.BASE,
        bookingPayload
      );

      if (response.success) {
        // Link the booking to the customer
        try {
          console.log("Attempting to link booking to customer:", customer._id);
          const linkResponse = await api.post(CONFIG.ENDPOINTS.CUSTOMERS.AUTO_LINK(customer._id));
          console.log("Link response:", linkResponse);
        } catch (linkError) {
          console.error("Failed to link booking to customer:", linkError);
          // Don't fail the whole booking if linking fails
        }
        
        onSuccess && onSuccess();
        onClose && onClose();
      }
    } catch (error) {
      console.error("Error creating express booking:", error);
      setError(error.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  if (servicesLoading || configLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg w-full max-w-2xl border border-border-light dark:border-stone-700 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-medium text-content-dark dark:text-white">
              Express Booking
            </h3>
            <p className="text-content-light dark:text-stone-400">
              {customer.name || customer.phone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Intelligence */}
          {(customer.stats?.totalBookings > 0 || customer.stats?.totalSpent > 0) && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Customer Insights</h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Total Bookings:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                    {customer.stats?.totalBookings || 0}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Total Spent:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                    ${customer.stats?.totalSpent?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Status:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                    {customer.stats?.totalBookings >= 10 ? "VIP" : 
                     customer.stats?.totalBookings >= 5 ? "Regular" : "New"}
                  </span>
                </div>
              </div>
              {customer.bookingHistory && customer.bookingHistory.length > 0 && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Last visit: {new Date(customer.bookingHistory[customer.bookingHistory.length - 1]?.dateTime).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Customer Info (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={bookingData.name}
                readOnly
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-DEFAULT dark:bg-stone-700 text-content-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={bookingData.contact}
                readOnly
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-DEFAULT dark:bg-stone-700 text-content-light"
              />
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Appointment Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium mb-2">Time Slot</label>
            <select
              name="time"
              value={bookingData.time}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
            >
              <option value="">Select Time</option>
              {businessHours.map((time) => {
                const count = timeSlots[time]?.count || 0;
                const style =
                  count > 0
                    ? "font-semibold text-amber-500 dark:text-amber-400"
                    : "";
                return (
                  <option key={time} value={time} className={style}>
                    {time} {count > 0 ? `(${count} existing)` : "(empty)"}
                  </option>
                );
              })}
            </select>
            {validationErrors.time && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.time}
              </p>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Type *</label>
              <select
                value={bookingData.vehicleType}
                onChange={(e) =>
                  setBookingData({ ...bookingData, vehicleType: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              >
                <option value="">Select Vehicle Type</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              {validationErrors.vehicleType && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.vehicleType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Make & Model *</label>
              <input
                type="text"
                name="makeModel"
                value={bookingData.makeModel}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                placeholder="Honda Civic"
              />
              {validationErrors.makeModel && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.makeModel}</p>
              )}
            </div>
          </div>

          {/* Service Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Service *</label>
              <select
                name="serviceId"
                value={bookingData.serviceId}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              >
                <option value="">Select Service</option>
                {services?.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - $
                    {service.vehiclePricing[bookingData.vehicleType] || "N/A"}
                  </option>
                ))}
                <option value="custom_interior">Interior Only</option>
                <option value="custom_exterior">Exterior Only</option>
              </select>
              {validationErrors.serviceId && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.serviceId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Scent</label>
              <select
                name="selectedScent"
                value={bookingData.selectedScent}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              >
                <option value="">Select Scent</option>
                {scents?.map((scent) => (
                  <option key={scent.id} value={scent.id?.toString()}>
                    {scent.name}
                  </option>
                ))}
              </select>
              {validationErrors.selectedScent && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.selectedScent}
                </p>
              )}
            </div>
          </div>

          {isCustomService && priceOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Price Level
              </label>
              {priceOptions.length > 1 ? (
                <select
                  name="selectedPrice"
                  value={bookingData.selectedPrice}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                >
                  <option value="">Select Price Level</option>
                  {priceOptions.map((price, index) => (
                    <option key={index} value={price}>
                      Level {index + 1} - ${price}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-content-dark dark:text-white">
                  Price: ${priceOptions[0]}
                </p>
              )}
              {validationErrors.selectedPrice && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.selectedPrice}
                </p>
              )}
            </div>
          )}

          {(services.find((s) => s._id === bookingData.serviceId) || isCustomService) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Optional Services
              </label>
              <div className="space-y-3">
                {optionalServices?.map((service) => {
                  const idStr = service.id?.toString();
                  const selected = bookingData.optionalServices.some(
                    (s) => s.serviceId.toString() === idStr
                  );
                  const qty = clampQty(optionalQuantities?.[idStr] || 1);
                  const perSeat = parseFloat(service.price || 0);
                  const extended =
                    isSeatShampoo(service) && selected
                      ? (perSeat * qty).toFixed(2)
                      : null;

                  return (
                    <div key={service.id} className="">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleOptionalServiceToggle(service)}
                          className="rounded border-border-DEFAULT"
                        />
                        <span>
                          {service.name} - ${service.price}
                          {extended ? ` (x${qty} = $${extended})` : ""}
                        </span>
                      </label>

                      {isSeatShampoo(service) && selected && (
                        <div className="ml-7 mt-1 flex items-center gap-2">
                          <span className="text-xs text-content-light">
                            Seats (max 4):
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(idStr, qty - 1)}
                            className="px-2 py-0.5 rounded border border-border-DEFAULT hover:bg-background-dark"
                            aria-label="Decrease seats"
                          >
                            -
                          </button>
                          <span className="min-w-[2ch] text-center text-sm font-medium">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(idStr, qty + 1)}
                            className="px-2 py-0.5 rounded border border-border-DEFAULT hover:bg-background-dark"
                            aria-label="Increase seats"
                          >
                            +
                          </button>
                          <span className="text-xs text-content-light">
                            ${perSeat} per seat
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="p-4 bg-background-dark dark:bg-stone-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-content-dark dark:text-white">
                Total Price:
              </span>
              <span className="text-xl font-bold text-primary-DEFAULT dark:text-orange-500">
                ${bookingData.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-content-DEFAULT dark:text-white 
                         bg-background-DEFAULT dark:bg-stone-700
                         hover:bg-background-dark dark:hover:bg-stone-600
                         border border-border-DEFAULT dark:border-stone-600
                         rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-light dark:bg-orange-500 
                         text-white rounded-lg 
                         hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
                         transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Express Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ExpressBooking.propTypes = {
  customer: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string,
    preferences: PropTypes.shape({
      defaultVehicleType: PropTypes.string,
      defaultVehicle: PropTypes.string,
      defaultService: PropTypes.string,
      defaultScent: PropTypes.string,
      preferredTime: PropTypes.string,
    }),
    bookingHistory: PropTypes.arrayOf(PropTypes.shape({
      vehicleType: PropTypes.string,
      serviceId: PropTypes.string,
      selectedScent: PropTypes.string,
      dateTime: PropTypes.string,
      makeModel: PropTypes.string,
    })),
    stats: PropTypes.shape({
      totalBookings: PropTypes.number,
      totalSpent: PropTypes.number,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default ExpressBooking;