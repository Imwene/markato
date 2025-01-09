// src/components/admin/bookings/StatusHistory.jsx
import React from 'react';
import { Clock, X } from 'lucide-react';

const StatusHistory = ({ history = [], onClose }) => {
  if (!history) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="relative bg-background-light dark:bg-stone-800 p-6 rounded-lg w-full max-w-lg border border-border-light dark:border-stone-700 shadow-lg m-4 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-background-light dark:bg-stone-800 pb-4 mb-4 border-b border-border-light dark:border-stone-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-content-dark dark:text-white">
              Status History
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-content-light dark:text-stone-400" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-center text-content-light dark:text-stone-400">
              No status history available
            </p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-light/10 dark:bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary-DEFAULT dark:text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-content-DEFAULT dark:text-white capitalize">
                    {item.status.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-content-light dark:text-stone-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  {item.note && (
                    <p className="text-sm text-content-light dark:text-stone-400 mt-1">
                      {item.note}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusHistory;