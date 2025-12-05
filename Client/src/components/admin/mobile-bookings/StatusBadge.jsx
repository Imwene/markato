import { Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import PropTypes from "prop-types";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-800 dark:text-amber-400',
      icon: Clock,
      label: 'Pending'
    },
    confirmed: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      icon: CheckCircle,
      label: 'Confirmed'
    },
    in_progress: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-400',
      icon: Truck,
      label: 'In Progress'
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      icon: CheckCircle,
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-400',
      icon: XCircle,
      label: 'Cancelled'
    }
  };
  
  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </div>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string
};

StatusBadge.defaultProps = {
  status: 'pending'
};

export default StatusBadge;