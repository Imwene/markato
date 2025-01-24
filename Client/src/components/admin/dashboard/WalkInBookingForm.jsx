import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useConfig } from '../../../hooks/useConfig';
import { useServices } from '../../../hooks/useServices';
import { formatToPacificDate, formatToPacificDateTime } from '../../../utils/dateUtils';
import api from '../../../utils/api';
import { CONFIG } from '../../../config/config';

const WalkInBookingForm = ({ onClose, onSuccess }) => {
  const { vehicleTypes, scents, optionalServices } = useConfig();
  const { services } = useServices();
  const [timeSlots, setTimeSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    makeModel: '',
    vehicleType: vehicleTypes[0]?.id || '',
    serviceId: '',
    selectedScent: '',
    time: '',
    optionalServices: []
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Get current Pacific date
  const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pacificDate = formatToPacificDate(new Date(currentDate));

  // Business hours (same as in the public booking system)
  const businessHours = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  useEffect(() => {
    fetchTimeSlotBookings();
  }, []);

  const fetchTimeSlotBookings = async () => {
    try {
      setLoading(true);
      const startDate = new Date(pacificDate);
      const endDate = new Date(pacificDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await api.get(
        `${CONFIG.ENDPOINTS.ADMIN.BOOKINGS.WEEKLY}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (response.success) {
        // Process bookings to get slot counts
        const slotCounts = {};
        businessHours.forEach(time => {
          slotCounts[time] = {
            count: response.data.filter(booking => {
              const bookingTime = new Date(booking.dateTime)
                .toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                });
              return bookingTime === time;
            }).length
          };
        });
        setTimeSlots(slotCounts);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load time slot information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.contact?.trim()) {
      errors.contact = 'Contact number is required';
    } else if (!phoneRegex.test(formData.contact)) {
      errors.contact = 'Invalid phone number format';
    }
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.makeModel?.trim()) errors.makeModel = 'Vehicle make/model is required';
    if (!formData.vehicleType) errors.vehicleType = 'Vehicle type is required';
    if (!formData.serviceId) errors.serviceId = 'Service is required';
    if (!formData.selectedScent) errors.selectedScent = 'Scent selection is required';
    if (!formData.time) errors.time = 'Time slot is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Debug logs
      // console.log('Form Data at submission:', formData);
      // console.log('Available Scents:', scents);
      // console.log('Selected Scent ID:', formData.selectedScent);
      // console.log('Scent Type:', typeof formData.selectedScent);

      // Check if there are any existing bookings in this slot
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

      // Find required booking details
      const selectedService = services.find(s => s._id === formData.serviceId);
      if (!selectedService) {
        throw new Error('Service not found');
      }

      // Find scent and convert ID types to match
      const selectedScentDetails = scents.find(s => s.id.toString() === formData.selectedScent.toString());
      if (!selectedScentDetails) {
        console.error('Failed to find scent. Available scents:', scents, 'Looking for ID:', formData.selectedScent);
        throw new Error('Selected scent not found');
      }

      // Debug logging
      // console.log('Selected Service:', selectedService);
      // console.log('Selected Scent:', selectedScentDetails);
      // console.log('Form Data:', formData);
      
      // Calculate prices
      const servicePrice = selectedService.vehiclePricing[formData.vehicleType];
      const selectedOptionalServices = formData.optionalServices.map(optionId => {
        const service = optionalServices.find(s => s.id.toString() === optionId.toString());
        if (!service) {
          throw new Error(`Optional service not found: ${optionId}`);
        }
        return {
          serviceId: service.id,
          name: service.name,
          price: parseFloat(service.price)
        };
      });
      
      const optionalServicesTotal = selectedOptionalServices.reduce(
        (sum, service) => sum + service.price, 
        0
      );
      
      const totalPrice = servicePrice + optionalServicesTotal;

      // Generate confirmation number
      const date = new Date();
      const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}${
        date.getDate().toString().padStart(2, '0')}${
        date.getFullYear().toString()}`;
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const confirmationNumber = `BK-${dateStr}-${random}`;

      // Format the date and time properly
      const selectedDate = new Date(pacificDate);
      const dateTime = formatToPacificDateTime(selectedDate, formData.time);

      const bookingPayload = {
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        email: formData.email?.trim(),
        vehicleType: formData.vehicleType,
        makeModel: formData.makeModel.trim(),
        dateTime,
        serviceId: selectedService._id,
        serviceName: selectedService.name,
        selectedScent: selectedScentDetails.name,
        servicePrice,
        features: selectedService.features || [],
        optionalServices: selectedOptionalServices,
        totalPrice,
        confirmationNumber,
        status: 'pending'
      };

      //console.log('Final Booking Payload:', bookingPayload);

      const response = await api.post(CONFIG.ENDPOINTS.BOOKINGS.BASE, bookingPayload);

      if (response.success) {
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    //console.log(`Input Change - Name: ${name}, Value: ${value}, Type: ${typeof value}`);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated Form Data:', newData);
      return newData;
    });
    
    // Clear validation error when field is modified
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleOptionalServiceToggle = (serviceId) => {
    setFormData(prev => {
      const newOptionalServices = prev.optionalServices.includes(serviceId)
        ? prev.optionalServices.filter(id => id !== serviceId)
        : [...prev.optionalServices, serviceId];
      
      return {
        ...prev,
        optionalServices: newOptionalServices
      };
    });
  };

  const selectedService = services.find(s => s._id === formData.serviceId);

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

          {/* Vehicle Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Type</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              >
                <option value="">Select Type</option>
                {vehicleTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              {validationErrors.vehicleType && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.vehicleType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Make & Model</label>
              <input
                type="text"
                name="makeModel"
                value={formData.makeModel}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                placeholder="e.g., Toyota Camry"
              />
              {validationErrors.makeModel && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.makeModel}</p>
              )}
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Service</label>
            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
            >
              <option value="">Select Service</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name} - ${service.vehiclePricing[formData.vehicleType] || 'N/A'}
                </option>
              ))}
            </select>
            {validationErrors.serviceId && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.serviceId}</p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Time Slot</label>
            <select
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
            >
              <option value="">Select Time</option>
              {businessHours.map(time => {
                const count = timeSlots[time]?.count || 0;
                const style = count > 0 ? 'font-semibold text-amber-500 dark:text-amber-400' : '';
                return (
                  <option key={time} value={time} className={style}>
                    {time} {count > 0 ? `(${count} existing)` : '(empty)'}
                  </option>
                );
              })}
            </select>
            {validationErrors.time && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.time}</p>
            )}
          </div>

          {/* Scent Selection */}
          {selectedService && (
            <div>
              <label className="block text-sm font-medium mb-2">Scent Selection</label>
              <select
                name="selectedScent"
                value={formData.selectedScent}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              >
                <option value="">Select Scent</option>
                {scents.map(scent => (
                  <option key={scent.id} value={scent.id?.toString()}>
                    {scent.name}
                  </option>
                ))}
              </select>
              {validationErrors.selectedScent && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.selectedScent}</p>
              )}
            </div>
          )}

          {/* Optional Services */}
          {selectedService && (
            <div>
              <label className="block text-sm font-medium mb-2">Optional Services</label>
              <div className="space-y-2">
                {optionalServices.map(service => (
                  <label key={service.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.optionalServices.includes(service.id?.toString())}
                      onChange={() => handleOptionalServiceToggle(service.id?.toString())}
                      className="rounded border-border-DEFAULT"
                    />
                    <span>{service.name} - ${service.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                placeholder="Full Name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
                placeholder="(123) 456-7890"
              />
              {validationErrors.contact && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.contact}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 rounded-lg border border-border-DEFAULT bg-background-light dark:bg-stone-800"
              placeholder="customer@example.com"
              required
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          {/* Submit Buttons */}
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
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkInBookingForm;