import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import api from '../../utils/api';

const AvailabilityManager = () => {
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState({});
  const [loading, setLoading] = useState(true);

  const businessHours = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  ];

  // Generate next 30 days
  const generateDates = () => {
    const dates = [];
    const current = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/availability');
      setBlockedDates(response.data.blockedDates || []);
      setBlockedTimeSlots(response.data.blockedTimeSlots || {});
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDateBlock = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      await api.post('/admin/availability/toggle-date', { date: formattedDate });
      fetchAvailability();
    } catch (error) {
      console.error('Error toggling date:', error);
    }
  };

  const toggleTimeSlot = async (date, time) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      await api.post('/admin/availability/toggle-slot', { 
        date: formattedDate,
        time 
      });
      fetchAvailability();
    } catch (error) {
      console.error('Error toggling time slot:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-content-dark dark:text-white">
          Manage Availability
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar View */}
        <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg border border-border-light dark:border-stone-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Block Entire Days
          </h3>
          
          <div className="grid grid-cols-7 gap-2">
            {generateDates().map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const isBlocked = blockedDates.includes(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => toggleDateBlock(date)}
                  className={`
                    p-2 rounded-lg text-sm font-medium
                    ${isBlocked 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-background-DEFAULT dark:bg-stone-700 text-content-DEFAULT dark:text-white'}
                    hover:opacity-80 transition-opacity
                  `}
                >
                  <span className="block text-xs">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="block text-lg">
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg border border-border-light dark:border-stone-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Block Specific Time Slots
          </h3>

          <div className="space-y-4">
            {businessHours.map((time) => {
              const isBlocked = blockedTimeSlots[time];

              return (
                <button
                  key={time}
                  onClick={() => toggleTimeSlot(new Date(), time)}
                  className={`
                    w-full p-3 rounded-lg flex justify-between items-center
                    ${isBlocked 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-background-DEFAULT dark:bg-stone-700 text-content-DEFAULT dark:text-white'}
                    hover:opacity-80 transition-opacity
                  `}
                >
                  <span>{time}</span>
                  {isBlocked && <X className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;