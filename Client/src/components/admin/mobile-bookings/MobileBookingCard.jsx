import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import PropTypes from "prop-types";
import StatusBadge from "./StatusBadge";
import DistanceIndicator from "./DistanceIndicator";
import QuickActions from "./QuickActions";
import AddressSection from "./AddressSection";
import ContactInfo from "./ContactInfo";
import DepositStatus from "./DepositStatus";
import OptionalServices from "./OptionalServices";

const MobileBookingCard = ({ booking, onStatusChange, onEdit, onHistory }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDirections = (address) => {
    if (!address) return;
    const encodedAddress = encodeURIComponent(`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg border border-gray-200 dark:border-stone-700 mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Card Header */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <DistanceIndicator distance={booking.distanceFromStore} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {booking.confirmationNumber}
            </span>
            <QuickActions 
              booking={booking} 
              onEdit={onEdit}
              onHistory={onHistory}
              onDirections={() => handleDirections(booking.customerAddress)}
            />
          </div>
        </div>

        {/* Key Information Section */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {booking.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">S</span>
            </div>
            <span>{booking.serviceName}</span>
            <span className="text-gray-400">•</span>
            <span>{booking.vehicleType} - {booking.makeModel}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock size={14} />
            <span>{booking.dateTime}</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              ${booking.totalPrice || 0}
            </span>
            <button
              onClick={toggleExpanded}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  <span>Show More</span>
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-stone-700 p-4 pt-3 space-y-3 animate-in slide-in-from-top duration-200">
          <AddressSection address={booking.customerAddress} />
          <ContactInfo contact={booking.contact} email={booking.email} />
          <DepositStatus 
            depositRequired={booking.depositRequired} 
            depositPaid={booking.depositPaid} 
            depositAmount={booking.depositAmount} 
          />
          {booking.optionalServices?.length > 0 && (
            <OptionalServices services={booking.optionalServices} />
          )}
          
          {/* Quick Status Change */}
          <div className="pt-2 border-t border-gray-100 dark:border-stone-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Status Update:
            </label>
            <select
              value={booking.status || "pending"}
              onChange={(e) => onStatusChange(booking._id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

MobileBookingCard.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    confirmationNumber: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    serviceName: PropTypes.string.isRequired,
    vehicleType: PropTypes.string.isRequired,
    makeModel: PropTypes.string.isRequired,
    dateTime: PropTypes.string.isRequired,
    totalPrice: PropTypes.number,
    status: PropTypes.string,
    distanceFromStore: PropTypes.number,
    customerAddress: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zipCode: PropTypes.string
    }),
    contact: PropTypes.string,
    email: PropTypes.string,
    depositRequired: PropTypes.bool,
    depositPaid: PropTypes.bool,
    depositAmount: PropTypes.number,
    optionalServices: PropTypes.array
  }).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onHistory: PropTypes.func.isRequired
};

export default MobileBookingCard;