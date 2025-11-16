import { Plus } from "lucide-react";
import PropTypes from "prop-types";

const OptionalServices = ({ services }) => {
  if (!services || services.length === 0) return null;

  const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Plus className="w-4 h-4" />
        <span>Optional Services ({services.length})</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          +${totalPrice.toFixed(2)}
        </span>
      </div>
      
      <div className="space-y-1 pl-6">
        {services.map((service) => (
          <div 
            key={service._id || service.serviceId}
            className="text-sm text-gray-600 dark:text-gray-400 flex justify-between"
          >
            <span>{service.name}</span>
            <span className="font-medium">${service.price || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

OptionalServices.propTypes = {
  services: PropTypes.array
};

OptionalServices.defaultProps = {
  services: []
};

export default OptionalServices;