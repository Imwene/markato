import React from 'react';
import { vehicleTypes } from '../../constants';
import { ChevronDown } from 'lucide-react';

const VehicleTypeSelector = ({ selectedType, onTypeChange }) => {
  return (
    <div className="relative mb-6">
      <label htmlFor="vehicleType" className="block text-sm font-medium text-neutral-300 mb-2">
        Select Vehicle Type
      </label>
      <div className="relative">
        <select
          id="vehicleType"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full p-3 pr-10 bg-neutral-800 border border-neutral-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
        >
          {vehicleTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-neutral-400" />
        </div>
      </div>
    </div>
  );
};

export default VehicleTypeSelector;