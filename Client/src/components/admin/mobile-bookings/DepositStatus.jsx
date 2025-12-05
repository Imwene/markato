import { DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

const DepositStatus = ({ depositRequired, depositPaid, depositAmount }) => {
  if (!depositRequired) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <DollarSign className="w-4 h-4" />
        <span>No deposit required</span>
      </div>
    );
  }

  const statusConfig = depositPaid 
    ? {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        icon: CheckCircle,
        label: 'Deposit Paid'
      }
    : {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        icon: AlertCircle,
        label: 'Deposit Due'
      };

  const Icon = statusConfig.icon;

  return (
    <div className="flex items-center justify-between">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusConfig.bg}`}>
        <Icon className="w-4 h-4" />
        <span className={`text-sm font-medium ${statusConfig.text}`}>
          {statusConfig.label}
        </span>
      </div>
      {depositAmount && (
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          ${depositAmount}
        </span>
      )}
    </div>
  );
};

DepositStatus.propTypes = {
  depositRequired: PropTypes.bool,
  depositPaid: PropTypes.bool,
  depositAmount: PropTypes.number
};

DepositStatus.defaultProps = {
  depositRequired: false,
  depositPaid: false,
  depositAmount: 0
};

export default DepositStatus;