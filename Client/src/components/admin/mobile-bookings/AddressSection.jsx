import { MapPin, ExternalLink } from "lucide-react";
import PropTypes from "prop-types";

const AddressSection = ({ address }) => {
  if (!address) return null;

  const formatAddress = (addr) => {
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
  };

  const getDirectionsUrl = (addr) => {
    const encodedAddress = encodeURIComponent(formatAddress(addr));
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-stone-300">
            {formatAddress(address)}
          </p>
          <a
            href={getDirectionsUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1"
          >
            <ExternalLink size={12} />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
};

AddressSection.propTypes = {
  address: PropTypes.shape({
    street: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipCode: PropTypes.string
  })
};

export default AddressSection;