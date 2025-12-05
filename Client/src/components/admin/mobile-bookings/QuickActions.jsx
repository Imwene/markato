import { Edit, History, Navigation } from "lucide-react";
import PropTypes from "prop-types";

const QuickActions = ({ booking, onEdit, onHistory, onDirections }) => {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onEdit(booking)}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
        title="Edit Booking"
      >
        <Edit size={16} className="text-gray-600 dark:text-gray-400" />
      </button>
      <button
        onClick={() => onHistory(booking)}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
        title="View History"
      >
        <History size={16} className="text-gray-600 dark:text-gray-400" />
      </button>
      <button
        onClick={onDirections}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
        title="Get Directions"
      >
        <Navigation size={16} className="text-blue-600 dark:text-blue-400" />
      </button>
    </div>
  );
};

QuickActions.propTypes = {
  booking: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onHistory: PropTypes.func.isRequired,
  onDirections: PropTypes.func.isRequired
};

export default QuickActions;