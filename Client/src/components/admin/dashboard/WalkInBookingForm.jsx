import { useState, useEffect, useMemo, useCallback } from "react";
import { X, AlertCircle } from "lucide-react";
import { useConfig } from "../../../hooks/useConfig";
import { useServices } from "../../../hooks/useServices";
import {
  formatToPacificDate,
  formatToPacificDateTime,
} from "../../../utils/dateUtils";
import api from "../../../utils/api";
import { CONFIG } from "../../../config/config";
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
      sedan: [30, 50],
      "mini-suv": [40, 70],
      suv: [50, 80],
      "van/truck": [50, 80],
    },
  },
  exterior: {
    id: "custom_exterior",
    name: "Exterior Only",
    pricing: {
      sedan: [25, 40],
      "mini-suv": [35, 50],
      suv: [40, 45, 60],
      "van/truck": [40, 45, 60],
    },
  },
};

const WalkInBookingForm = ({ onClose, onSuccess }) => {
  const { vehicleTypes, scents, optionalServices } = useConfig();
  const { services } = useServices();
  const [timeSlots, setTimeSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    makeModel: "",
    vehicleType: vehicleTypes[0]?.id || "",
    serviceId: "",
    selectedScent: "",
    time: "",
    optionalServices: [],
    selectedPrice: "",
  });

  const [optionalQuantities, setOptionalQuantities] = useState({});

  const [validationErrors, setValidationErrors] = useState({});

  const currentDate = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });
  const pacificDate = formatToPacificDate(new Date(currentDate));

  const businessHours = BUSINESS_HOURS;

  const fetchTimeSlotBookings = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = new Date(pacificDate);
      const endDate = new Date(pacificDate);
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
  }, [pacificDate, businessHours]);

  useEffect(() => {
    fetchTimeSlotBookings();
  }, [fetchTimeSlotBookings]);

  const isCustomService = formData.serviceId.startsWith("custom_");
  const customServiceType = isCustomService
    ? formData.serviceId.split("_")[1]
    : null;
  const priceOptions = useMemo(() => {
    if (!isCustomService || !customServiceType) return [];
    return (
      UNLISTED_SERVICES[customServiceType]?.pricing[formData.vehicleType] || []
    );
  }, [isCustomService, customServiceType, formData.vehicleType]);

  useEffect(() => {
    if (isCustomService) {
      if (priceOptions.length === 1) {
        setFormData((prev) => ({ ...prev, selectedPrice: priceOptions[0] }));
      } else if (
        priceOptions.length > 1 &&
        !priceOptions.includes(Number(formData.selectedPrice))
      ) {
        setFormData((prev) => ({ ...prev, selectedPrice: "" }));
      }
    }
  }, [isCustomService, priceOptions, formData.selectedPrice]);

  const validateForm = () => {
    const errors = {};
    const phoneRegex =
      /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.contact?.trim()) {
      errors.contact = "Contact number is required";
    } else if (!phoneRegex.test(formData.contact)) {
      errors.contact = "Invalid phone number format";
    }
    if (formData.email?.trim()) {
      if (!emailRegex.test(formData.email)) {
        errors.email = "Invalid email format";
      }
    }
    if (!formData.makeModel?.trim())
      errors.makeModel = "Vehicle make/model is required";
    if (!formData.vehicleType) errors.vehicleType = "Vehicle type is required";
    if (!formData.serviceId) errors.serviceId = "Service is required";
    if (isCustomService && !formData.selectedPrice)
      errors.selectedPrice = "Price level is required";
    if (!formData.selectedScent)
      errors.selectedScent = "Scent selection is required";
    if (!formData.time) errors.time = "Time slot is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const currentCount = timeSlots[formData.time]?.count || 0;
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
        serviceId = formData.serviceId;
        serviceName = UNLISTED_SERVICES[customServiceType].name;
        servicePrice = Number(formData.selectedPrice);
        features = [];
      } else {
        const selectedService = services.find(
          (s) => s._id === formData.serviceId
        );
        if (!selectedService) throw new Error("Service not found");
        serviceId = selectedService._id;
        serviceName = selectedService.name;
        servicePrice = selectedService.vehiclePricing[formData.vehicleType];
        features = selectedService.features || [];
      }

      const selectedScentDetails = scents.find(
        (s) => s.id.toString() === formData.selectedScent.toString()
      );
      if (!selectedScentDetails) throw new Error("Selected scent not found");

      const isSeatShampoo = (svc) => {
        return (
          svc?.name?.toLowerCase?.() === "seat cloth shampoo" || svc?.id === 4
        );
      };

      const selectedOptionalServices = formData.optionalServices.map(
        (optionId) => {
          const service = optionalServices.find(
            (s) => s.id.toString() === optionId.toString()
          );
          if (!service)
            throw new Error(`Optional service not found: ${optionId}`);

          const base = parseFloat(service.price);

          if (isSeatShampoo(service)) {
            const qty = Math.max(
              1,
              Math.min(4, Number(optionalQuantities?.[optionId]) || 1)
            );
            return {
              serviceId: service.id,
              name: `${service.name} (x${qty} seat${qty > 1 ? "s" : ""})`,
              price: base * qty,
            };
          }

          return {
            serviceId: service.id,
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

      const selectedDate = new Date(pacificDate);
      const dateTime = formatToPacificDateTime(selectedDate, formData.time);

      const bookingPayload = {
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        email: formData.email?.trim(),
        vehicleType: formData.vehicleType,
        makeModel: formData.makeModel.trim(),
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
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError(error.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleOptionalServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const already = prev.optionalServices.includes(serviceId);
      const newOptionalServices = already
        ? prev.optionalServices.filter((id) => id !== serviceId)
        : [...prev.optionalServices, serviceId];

      // Maintain quantities only for selected options; default to 1 when newly selected
      setOptionalQuantities((prevQty) => {
        const next = { ...prevQty };
        if (already) {
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

  const selectedService = services.find((s) => s._id === formData.serviceId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-light dark:bg-stone-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-light dark:border-stone-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-content-dark dark:text-white">
              Create Walk-in Booking
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              >
                <option value="">Select Type</option>
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              {validationErrors.vehicleType && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.vehicleType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Make & Model
              </label>
              <input
                type="text"
                name="makeModel"
                value={formData.makeModel}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                placeholder="e.g., Toyota Camry"
              />
              {validationErrors.makeModel && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.makeModel}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service</label>
            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
            >
              <option value="">Select Service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} - $
                  {service.vehiclePricing[formData.vehicleType] || "N/A"}
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

          {isCustomService && priceOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Price Level
              </label>
              {priceOptions.length > 1 ? (
                <select
                  name="selectedPrice"
                  value={formData.selectedPrice}
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

          <div>
            <label className="block text-sm font-medium mb-2">Time Slot</label>
            <select
              name="time"
              value={formData.time}
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

          {(selectedService || isCustomService) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Scent Selection
              </label>
              <select
                name="selectedScent"
                value={formData.selectedScent}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              >
                <option value="">Select Scent</option>
                {scents.map((scent) => (
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
          )}

          {(selectedService || isCustomService) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Optional Services
              </label>
              <div className="space-y-3">
                {optionalServices.map((service) => {
                  const idStr = service.id?.toString();
                  const selected = formData.optionalServices.includes(idStr);
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
                          onChange={() => handleOptionalServiceToggle(idStr)}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Customer Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                placeholder="Full Name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                placeholder="(123) 456-7890"
              />
              {validationErrors.contact && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.contact}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email{" "}
              <span className="text-content-light text-xs">(Optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              placeholder="customer@example.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-border-light dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkInBookingForm;

WalkInBookingForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
