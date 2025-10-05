import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { CONFIG } from "../../../config/config";
import api from "../../../utils/api";

const WeeklyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  // Add state for mobile view current day
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay());

  // Refs for auto-scroll functionality
  const containerRef = useRef(null);
  const dayRefs = useRef([]);

  useEffect(() => {
    fetchWeeklyAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  const fetchWeeklyAppointments = async () => {
    try {
      setLoading(true);
      const startDate = getWeekStartDate(currentWeek);
      const endDate = getWeekEndDate(currentWeek);

      const bookings = await api.get(
        `${
          CONFIG.ENDPOINTS.ADMIN.BOOKINGS.WEEKLY
        }?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (bookings.success) {
        setAppointments(bookings.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
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
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const navigateDay = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentDayIndex + 1) % 7
        : (currentDayIndex - 1 + 7) % 7;
    setCurrentDayIndex(newIndex);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      confirmed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      in_progress:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      colors[status?.toLowerCase()] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    );
  };

  const getDayAppointments = (date) => {
    const dayAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.dateTime);
      return appointmentDate.toDateString() === date.toDateString();
    });

    // Sort appointments by time
    return dayAppointments.sort((a, b) => {
      const timeA = new Date(a.dateTime).getTime();
      const timeB = new Date(b.dateTime).getTime();
      return timeA - timeB;
    });
  };

  // Compact appointment for desktop timeline view
  const renderTimelineAppointment = (appointment) => {
    const totalPrice =
      appointment.servicePrice +
      (appointment.optionalServices?.reduce(
        (sum, service) => sum + service.price,
        0
      ) || 0);

    return (
      <div className="flex items-start gap-3 md:gap-4 p-3 rounded-lg bg-white dark:bg-stone-900 border-2 border-border-light dark:border-stone-700 hover:border-primary-light dark:hover:border-orange-500 hover:shadow-md shadow-sm transition-all group">
        {/* Time & Status */}
        <div className="flex flex-col items-center min-w-[60px] md:min-w-[65px] pt-0.5">
          <span className="text-xs md:text-sm font-bold text-primary-DEFAULT dark:text-orange-500">
            {new Date(appointment.dateTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          <span
            className={`mt-1.5 inline-flex items-center px-1.5 md:px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
              appointment.status
            )}`}
          >
            <span className="hidden lg:inline">{appointment.status}</span>
            <span className="lg:hidden">
              {appointment.status.substring(0, 3)}
            </span>
          </span>
        </div>

        {/* Customer Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-semibold text-content-dark dark:text-white truncate">
            {appointment.name}
          </p>
          <p className="text-xs font-semibold text-content-dark dark:text-stone-300 mt-0.5 truncate">
            #{appointment.confirmationNumber}
          </p>
          <p className="text-xs font-semibold text-content-dark dark:text-stone-300 mt-0.5 truncate">
            {appointment.contact}
          </p>
          {/* Show vehicle on medium screens under customer info */}
          <p className="text-xs text-content-light dark:text-stone-400 mt-0.5 truncate xl:hidden">
            {appointment.vehicleType} - {appointment.makeModel}
          </p>
        </div>

        {/* Vehicle Info - Visible only on xl+ screens */}
        <div className="hidden xl:flex xl:flex-col min-w-[180px]">
          <p className="text-xs text-content-light dark:text-stone-400">
            Vehicle
          </p>
          <p className="text-sm font-medium text-content-dark dark:text-white">
            {appointment.vehicleType}
          </p>
          <p className="text-xs text-content-light dark:text-stone-400">
            {appointment.makeModel}
          </p>
        </div>

        {/* Service Info */}
        <div className="min-w-[140px] md:min-w-[180px] xl:min-w-[200px]">
          <p className="text-xs text-content-light dark:text-stone-400">
            Service
          </p>
          <p className="text-xs md:text-sm font-medium text-content-dark dark:text-white truncate">
            {appointment.serviceName}
          </p>
          <p className="text-xs text-content-light dark:text-stone-400 truncate">
            Scent: {appointment.selectedScent}
          </p>
        </div>

        {/* Optional Services & Price */}
        <div className="min-w-[100px] md:min-w-[140px] text-right">
          <p className="text-base md:text-lg font-bold text-primary-DEFAULT dark:text-orange-500">
            ${totalPrice.toFixed(2)}
          </p>
          {appointment.optionalServices?.length > 0 && (
            <div className="mt-1">
              <p className="text-xs text-content-light dark:text-stone-400">
                + {appointment.optionalServices.length} add-on
                {appointment.optionalServices.length > 1 ? "s" : ""}
              </p>
              <div className="text-xs text-content-light dark:text-stone-400 mt-0.5">
                {appointment.optionalServices.map((service, idx) => (
                  <div key={idx} className="truncate">
                    {service.name} (${service.price})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Full appointment card for mobile view
  const renderAppointmentCard = (appointment) => (
    <div className="p-3 rounded-lg bg-background-DEFAULT dark:bg-stone-800 border border-border-light dark:border-stone-700">
      <p className="text-sm font-medium text-content-dark dark:text-white mb-1">
        {new Date(appointment.dateTime).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
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
        {appointment.serviceName} - ${appointment.servicePrice} • Scent:{" "}
        {appointment.selectedScent}
      </p>
      {appointment.optionalServices?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border-light dark:border-stone-700">
          <p className="text-xs font-medium text-content-DEFAULT dark:text-stone-300">
            Add-ons:
          </p>
          {appointment.optionalServices.map((service, idx) => (
            <p
              key={idx}
              className="text-xs text-content-light dark:text-stone-400 ml-2"
            >
              • {service.name} (${service.price})
            </p>
          ))}
        </div>
      )}
      <span
        className={`inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium rounded-full ${getStatusColor(
          appointment.status
        )}`}
      >
        {appointment.status}
      </span>
    </div>
  );

  // Auto-scroll to today's section on md+ screens (within container only)
  useEffect(() => {
    if (typeof window === "undefined" || loading) return;

    const isMdUp = window.matchMedia("(min-width: 768px)").matches;
    if (!isMdUp) return;

    const container = containerRef.current;
    if (!container || !dayRefs.current || dayRefs.current.length === 0) return;

    const start = getWeekStartDate(currentWeek);
    const end = getWeekEndDate(currentWeek);
    const now = new Date();

    // Only auto-scroll if today is in the current week
    if (now < start || now > end) return;

    const todayIndex = now.getDay(); // 0 (Sun) - 6 (Sat)
    const target = dayRefs.current[todayIndex];

    if (target) {
      setTimeout(() => {
        // Calculate the correct position relative to the scrollable container
        // This ensures the day header is visible with padding above it
        let offsetTop = 0;
        let element = target;

        // Walk up the DOM tree to calculate total offset from container
        while (element && element !== container) {
          offsetTop += element.offsetTop;
          element = element.offsetParent;
        }

        // Scroll to position above the day card so it's clearly visible
        // Use negative offset to show padding before the day starts
        const scrollPosition = Math.max(0, offsetTop - 300);

        container.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }, 150);
    }
  }, [currentWeek, loading, appointments]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500" />
      </div>
    );
  }

  const startDate = getWeekStartDate(currentWeek);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  const renderDayColumnMobile = (date) => {
    const dayAppointments = getDayAppointments(date);
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <div
        className={`flex-1 min-w-[300px] p-4 border-r last:border-r-0 border-border-light dark:border-stone-700 ${
          isToday ? "bg-primary-light/5 dark:bg-orange-500/5" : ""
        }`}
      >
        <h3
          className={`font-medium mb-2 ${
            isToday
              ? "text-primary-DEFAULT dark:text-orange-500"
              : "text-content-dark dark:text-white"
          }`}
        >
          {date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          {isToday && <span className="ml-1 text-xs">(Today)</span>}
        </h3>
        <div className="space-y-3">
          {dayAppointments.length > 0 ? (
            dayAppointments.map((appointment, index) => (
              <div key={index}>{renderAppointmentCard(appointment)}</div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-content-light dark:text-stone-400">
              <Calendar className="w-5 h-5 mb-1 opacity-50" />
              <span className="text-sm">No appointments</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background-light dark:bg-stone-800 rounded-lg border border-border-light dark:border-stone-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b border-border-light dark:border-stone-700 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-content-dark dark:text-white">
            Weekly Appointments
          </h3>
          <p className="text-sm text-content-light dark:text-stone-400 mt-1">
            {startDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}{" "}
            -{" "}
            {getWeekEndDate(currentWeek).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek("prev")}
            className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors border border-border-light dark:border-stone-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateWeek("next")}
            className="p-2 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors border border-border-light dark:border-stone-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop/Tablet View - Timeline Layout */}
      <div className="hidden md:block p-4">
        <div className="max-h-[750px] overflow-y-auto pr-2" ref={containerRef}>
          <div className="space-y-1">
            {dates.map((date, index) => {
              const dayAppointments = getDayAppointments(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const appointmentCount = dayAppointments.length;

              return (
                <div
                  key={index}
                  ref={(el) => (dayRefs.current[index] = el)}
                  className={`rounded-lg border-2 transition-all ${
                    isToday
                      ? "border-primary-DEFAULT dark:border-orange-500 bg-primary-light/5 dark:bg-orange-500/5 shadow-md"
                      : "border-border-DEFAULT dark:border-stone-700 bg-background-light dark:bg-stone-900"
                  }`}
                >
                  {/* Day Header - More Compact */}
                  <div
                    className={`flex items-center justify-between px-4 py-2.5 ${
                      appointmentCount > 0
                        ? "border-b border-border-light dark:border-stone-700"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-sm font-bold ${
                          isToday
                            ? "text-primary-DEFAULT dark:text-orange-500"
                            : "text-content-dark dark:text-white"
                        }`}
                      >
                        {date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </h3>
                      {isToday && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-light dark:bg-orange-500 text-white">
                          Today
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        appointmentCount > 0
                          ? "bg-primary-light dark:bg-orange-500 text-white"
                          : "bg-gray-300 dark:bg-stone-700 text-gray-700 dark:text-stone-400"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {appointmentCount}
                    </div>
                  </div>

                  {/* Appointments for this day */}
                  {appointmentCount > 0 ? (
                    <div className="p-3 space-y-2">
                      {dayAppointments.map((appointment, idx) => (
                        <div key={idx}>
                          {renderTimelineAppointment(appointment)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4 text-content-light dark:text-stone-400">
                      <Calendar className="w-4 h-4 mr-2 opacity-40" />
                      <span className="text-xs">No appointments</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile View - Unchanged */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-stone-700">
          <button
            onClick={() => navigateDay("prev")}
            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="font-medium">
            {dates[currentDayIndex].toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h4>
          <button
            onClick={() => navigateDay("next")}
            className="p-1 hover:bg-background-dark dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {renderDayColumnMobile(dates[currentDayIndex])}
        </div>
      </div>
    </div>
  );
};

export default WeeklyAppointments;
