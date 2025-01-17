// src/components/admin/services/ServiceFormModal.jsx
import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import api from '../../../utils/api';
import {CONFIG} from '../../../config/config';
import { useConfig } from '../../../hooks/useConfig';

const ServiceFormModal = ({ service, onClose, onSave }) => {
  const { vehicleTypes } = useConfig();
  const [formData, setFormData] = useState({
    name: service?.name || '',
    features: service?.features || [''],
    vehiclePricing: service?.vehiclePricing || 
      vehicleTypes.reduce((acc, type) => ({
        ...acc,
        [type.id]: 0
      }), {}),
    category: service?.category || 'DRIVE-IN',
    isActive: service?.isActive ?? true,
    sortOrder: service?.sortOrder || 0
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    // Validate features
    if (!formData.features.some(feature => feature.trim())) {
      newErrors.features = 'At least one feature is required';
    }

    // Validate pricing
    const hasInvalidPricing = Object.values(formData.vehiclePricing).some(
      price => isNaN(price) || price < 0
    );
    if (hasInvalidPricing) {
      newErrors.pricing = 'All pricing values must be valid numbers greater than or equal to 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ 
      ...formData, 
      features: [...formData.features, ''] 
    });
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index)
      });
    }
  };

  const handlePriceChange = (vehicleType, price) => {
    setFormData({
      ...formData,
      vehiclePricing: {
        ...formData.vehiclePricing,
        [vehicleType]: Number(price)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || submitting) {
      return;
    }
  
    try {
      setSubmitting(true);
      
      const url = service?._id 
  ? CONFIG.ENDPOINTS.SERVICES.BY_ID(service._id)
  : CONFIG.ENDPOINTS.SERVICES.BASE;
        
      const data = service?._id 
        ? await api.put(url, formData)
        : await api.post(url, formData);
  
      if (data.success) {
        onSave(data.data);
        onClose();
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.message
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-background-light dark:bg-stone-800 rounded-lg w-full max-w-2xl 
                    border border-border-light dark:border-stone-700 shadow-lg 
                    flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-light dark:border-stone-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-content-dark dark:text-white">
              {service?._id ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 
                       rounded-lg transition-colors text-content-light dark:text-stone-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-content-DEFAULT dark:text-white">
                Service Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 rounded-lg border transition-colors
                         bg-background-light dark:bg-stone-800 
                         border-border-DEFAULT dark:border-stone-700
                         text-content-DEFAULT dark:text-white 
                         focus:border-primary-light dark:focus:border-orange-500"
                placeholder="Enter service name"
              />
              {errors.name && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2 text-content-DEFAULT dark:text-white">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 rounded-lg border transition-colors
                         bg-background-light dark:bg-stone-800 
                         border-border-DEFAULT dark:border-stone-700
                         text-content-DEFAULT dark:text-white"
              >
                <option value="DRIVE-IN">Drive-in</option>
                <option value="APPOINTMENT">Appointment</option>
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium mb-2 text-content-DEFAULT dark:text-white">
                Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 p-2 rounded-lg border transition-colors
                               bg-background-light dark:bg-stone-800 
                               border-border-DEFAULT dark:border-stone-700
                               text-content-DEFAULT dark:text-white"
                      placeholder="Feature description"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 
                               rounded-lg transition-colors text-red-500"
                      disabled={formData.features.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-2 text-sm text-primary-DEFAULT dark:text-orange-500 
                           hover:text-primary-dark dark:hover:text-orange-400"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
              {errors.features && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.features}</p>
              )}
            </div>

            {/* Vehicle Pricing */}
            <div>
              <label className="block text-sm font-medium mb-2 text-content-DEFAULT dark:text-white">
                Pricing
              </label>
              <div className="grid grid-cols-2 gap-4">
                {vehicleTypes.map((vehicleType) => (
                  <div key={vehicleType.id}>
                    <label className="block text-sm text-content-light dark:text-stone-400 mb-1 capitalize">
                      {vehicleType.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.vehiclePricing[vehicleType.id] || 0}
                      onChange={(e) => handlePriceChange(vehicleType.id, e.target.value)}
                      className="w-full p-2 rounded-lg border transition-colors
                               bg-background-light dark:bg-stone-800 
                               border-border-DEFAULT dark:border-stone-700
                               text-content-DEFAULT dark:text-white"
                    />
                  </div>
                ))}
              </div>
              {errors.pricing && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.pricing}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-border-DEFAULT bg-background-light dark:bg-stone-800"
              />
              <label htmlFor="isActive" className="text-sm text-content-DEFAULT dark:text-white">
                Active
              </label>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

          {/* Submit Button */}
          <div className="p-6 border-t border-border-light dark:border-stone-700 bg-background-light dark:bg-stone-800">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors
                       bg-background-DEFAULT dark:bg-stone-700 
                       text-content-DEFAULT dark:text-white 
                       border border-border-DEFAULT dark:border-stone-600 
                       hover:bg-background-dark dark:hover:bg-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg transition-colors
                       bg-primary-light dark:bg-orange-500 
                       text-white
                       hover:bg-primary-DEFAULT dark:hover:bg-orange-600 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting 
                ? 'Saving...' 
                : (service?._id ? 'Update Service' : 'Create Service')
              }
            </button>
          </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;