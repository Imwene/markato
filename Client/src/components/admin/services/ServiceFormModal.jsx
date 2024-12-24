// src/components/admin/services/ServiceFormModal.jsx
import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const ServiceFormModal = ({ service, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    features: service?.features || [''],
    vehiclePricing: service?.vehiclePricing || {
      'sedan': 0,
      'mini-suv': 0,
      'suv': 0,
      'van/truck': 0
    },
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
        ? `/api/services/${service._id}`
        : '/api/services';
        
      const response = await fetch(url, {
        method: service?._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter(f => f.trim()) // Remove empty features
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save service');
      }

      const data = await response.json();
      
      if (data.success) {
        onSave(data.data);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to save service');
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
      <div className="bg-background-light rounded-lg w-full max-w-2xl border border-border-DEFAULT shadow-lg flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-DEFAULT">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-content-dark">
            {service?._id ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background-dark rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 bg-background-light border border-border-DEFAULT rounded-lg"
              placeholder="Enter service name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 bg-background-light border border-border-DEFAULT rounded-lg"
            >
              <option value="DRIVE-IN">Drive-in</option>
              <option value="APPOINTMENT">Appointment</option>
            </select>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium mb-2">Features</label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 p-2 bg-background-light border border-border-DEFAULT rounded-lg"
                    placeholder="Feature description"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 hover:bg-background-dark rounded-lg transition-colors text-red-500"
                    disabled={formData.features.length === 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 text-sm text-primary-DEFAULT hover:text-primary-dark"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>
            {errors.features && (
              <p className="text-red-500 text-sm mt-1">{errors.features}</p>
            )}
          </div>

          {/* Vehicle Pricing */}
          <div>
            <label className="block text-sm font-medium mb-2">Pricing</label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.vehiclePricing).map(([vehicle, price]) => (
                <div key={vehicle}>
                  <label className="block text-sm text-content-light mb-1 capitalize">
                    {vehicle}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => handlePriceChange(vehicle, e.target.value)}
                    className="w-full p-2 bg-background-light border border-border-DEFAULT rounded-lg"
                  />
                </div>
              ))}
            </div>
            {errors.pricing && (
              <p className="text-red-500 text-sm mt-1">{errors.pricing}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-border-DEFAULT bg-background-light"
            />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="p-6 border-t border-border-DEFAULT bg-background-light">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border-DEFAULT rounded-lg hover:bg-background-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-DEFAULT 
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