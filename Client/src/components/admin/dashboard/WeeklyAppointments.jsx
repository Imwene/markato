import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { CONFIG } from "../../../config/config";
import api from "../../../utils/api";

const WeeklyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyAppointments();
  }, [currentWeek]);

  const fetchWeeklyAppointments = async () => {
    try {
      setLoading(true);
      const startDate = getWeekStartDate(currentWeek);
      const endDate = getWeekEndDate(currentWeek);

      const bookings = await api.get(`${CONFIG.ENDPOINTS.ADMIN.BOOKINGS.WEEKLY}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      
      if (bookings.success) {
        setAppointments(bookings.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Log request details
      console.log('Request params:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeekStartDate = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekEndDate = (date) => {
    const end = new Date(date);
    end.setDate(end.getDate() - end.getDay() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getDayAppointments = (date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const renderWeekDays = () => {
    const days = [];
    const startDate = getWeekStartDate(currentWeek);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dayAppointments = getDayAppointments(currentDate);

      days.push(
        <div key={i} className="flex-1 min-w-[300px] p-4 border-r last:border-r-0 border-border-light dark:border-stone-700">
          <h3 className="font-medium text-content-dark dark:text-white mb-2">
            {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </h3>
          <div className="space-y-3">
            {dayAppointments.map((appointment, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 border border-border-light dark:border-stone-700"
              >
                <p className="text-sm font-medium text-content-dark dark:text-white mb-1">
                  {new Date(appointment.dateTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
                <p className="text-sm text-content-DEFAULT dark:text-stone-300">
                  {appointment.name} • {appointment.confirmationNumber}
                </p>
                <p className="text-xs text-content-light dark:text-stone-400">
                  {appointment.contact}
                </p>
                <p className="text-xs text-content-light dark:text-stone-400">
                  {appointment.vehicleType} - {appointment.makeModel}
                </p>
                <p className="text-xs text-content-light dark:text-stone-400">
                  {appointment.serviceName} - ${appointment.servicePrice} • Scent: {appointment.selectedScent}
                </p>
                {appointment.optionalServices?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border-light dark:border-stone-700">
                    <p className="text-xs font-medium text-content-DEFAULT dark:text-stone-300">Add-ons:</p>
                    {appointment.optionalServices.map((service, idx) => (
                      <p key={idx} className="text-xs text-content-light dark:text-stone-400 ml-2">
                        • {service.name} (${service.price})
                      </p>
                    ))}
                  </div>
                )}
                <span className={`inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            ))}
            {dayAppointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-4 text-content-light dark:text-stone-400">
                <Calendar className="w-5 h-5 mb-1 opacity-50" />
                <span className="text-sm">No appointments</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700">
      <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-stone-700">
        <h3 className="text-xl font-bold text-content-dark dark:text-white">Weekly Appointments</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <div className="flex min-w-[2100px]">
            {renderWeekDays()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAppointments;