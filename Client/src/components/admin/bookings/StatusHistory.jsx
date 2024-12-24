// src/components/admin/bookings/StatusHistory.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const StatusHistory = ({ history = [] }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-4">Status History</h3>
      <div className="space-y-4">
        {history.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium capitalize">{item.status.replace('_', ' ')}</p>
              <p className="text-sm text-neutral-400">
                {new Date(item.timestamp).toLocaleString()}
              </p>
              {item.note && (
                <p className="text-sm text-neutral-300 mt-1">{item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusHistory;