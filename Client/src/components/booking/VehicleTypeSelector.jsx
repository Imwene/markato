import React from 'react';
import { useConfig } from '../../hooks/useConfig';
import { ChevronDown } from 'lucide-react';

const VehicleTypeSelector = ({ selectedType, onTypeChange }) => {
  const { vehicleTypes, loading } = useConfig();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
      </div>
    );
  }

  return (
    <div className="relative mb-6">
      <label 
        htmlFor="vehicleType" 
        className="block text-sm font-medium text-content-dark dark:text-white mb-2"
      >
        Select Vehicle Type
      </label>
      <div className="relative">
        <select
          id="vehicleType"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full p-3 pr-10 rounded-lg border-2 transition-colors duration-200
            bg-background-light dark:bg-stone-800
            border-border-DEFAULT dark:border-stone-700
            text-content-DEFAULT dark:text-white
            hover:border-border-dark dark:hover:border-stone-600
            focus:outline-none focus:border-primary-light dark:focus:border-orange-500
            appearance-none cursor-pointer"
        >
          {vehicleTypes.map((type) => (
            <option 
              key={type.id} 
              value={type.id}
              className="bg-background-light dark:bg-stone-800"
            >
              {type.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-content-light dark:text-stone-400" />
        </div>
      </div>
    </div>
  );
};

export default VehicleTypeSelector;