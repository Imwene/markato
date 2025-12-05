import { MapPin } from "lucide-react";
import PropTypes from "prop-types";

const DistanceIndicator = ({ distance }) => {
  if (!distance || distance <= 0) return null;
  
  const getDistanceColor = (miles) => {
    if (miles <= 5) {
      return 'text-green-600 dark:text-green-400';
    } else if (miles <= 10) {
      return 'text-amber-600 dark:text-amber-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };
  
  const getDistanceBgColor = (miles) => {
    if (miles <= 5) {
      return 'bg-green-100 dark:bg-green-900/30';
    } else if (miles <= 10) {
      return 'bg-amber-100 dark:bg-amber-900/30';
    } else {
      return 'bg-red-100 dark:bg-red-900/30';
    }
  };
  
  const colorClass = getDistanceColor(distance);
  const bgClass = getDistanceBgColor(distance);
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgClass} ${colorClass}`}>
      <MapPin size={12} />
      <span>{distance.toFixed(1)} mi</span>
    </div>
  );
};

DistanceIndicator.propTypes = {
  distance: PropTypes.number
};

export default DistanceIndicator;