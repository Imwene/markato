// src/components/booking/VehicleTypeSelector.jsx
import React from 'react';
import { useConfig } from '../../hooks/useConfig'; // Import useConfig
import { ChevronDown } from 'lucide-react';

const VehicleTypeSelector = ({ selectedType, onTypeChange }) => {
  const { vehicleTypes, loading } = useConfig(); // Access vehicleTypes from context

  if (loading) {
    return <div>Loading vehicle types...</div>
  }

  return (
    <div className="relative mb-6">
      <label htmlFor="vehicleType" className="block text-sm font-medium text-content-DEFAULT mb-2">
        Select Vehicle Type
      </label>
      <div className="relative">
        <select
          id="vehicleType"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full p-3 pr-10 bg-background-light border border-border-DEFAULT 
                   rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-light 
                   text-content-DEFAULT cursor-pointer hover:border-border-dark transition-colors"
        >
          {vehicleTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label} 
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-content-light" />
        </div>
      </div>
    </div>
  );
};

export default VehicleTypeSelector;