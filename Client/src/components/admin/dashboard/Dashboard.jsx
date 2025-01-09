import React, { useState, useEffect } from "react";
import { Calendar, Users, Clock, Star, Wind } from "lucide-react";
import api from "../../../utils/api.js";
import { useNavigate } from "react-router-dom";
import { CONFIG } from "../../../config/config.js";
import WeeklyAppointments from "./WeeklyAppointments";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    popularOptionalServices: [],
    popularScents: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.get(CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      if (error.message === "No token, authorization denied") {
        navigate("/login");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllBookings = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL bookings? This action cannot be undone."
      )
    ) {
      try {
        const data = await api.delete(
          CONFIG.ENDPOINTS.ADMIN.BOOKINGS.DELETE_ALL
        );

        if (data.success) {
          await fetchDashboardStats();
          alert("All bookings have been deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting bookings:", error);
        alert("Failed to delete bookings");
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg border border-border-light dark:border-stone-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-content-light dark:text-stone-400 text-sm">
            {title}
          </p>
          <p className="text-2xl font-bold text-content-dark dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className="p-3 bg-primary-light/10 dark:bg-orange-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary-DEFAULT dark:text-orange-500" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h1 className="text-2xl font-bold text-content-dark dark:text-white">
          Dashboard
        </h1>
        <div className="flex w-full sm:w-auto gap-2">
          <button
            onClick={fetchDashboardStats}
            className="flex-1 sm:flex-none px-4 py-2 text-sm bg-primary-light text-white rounded-lg hover:bg-primary-DEFAULT transition-colors"
          >
            <span className="hidden sm:inline">Refresh Data</span>
            <span className="sm:hidden">Refresh</span>
          </button>
          <button
            onClick={handleDeleteAllBookings}  
            className="flex-1 sm:flex-none px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <span className="hidden sm:inline">Delete All Bookings</span>
            <span className="sm:hidden">Delete All</span>
          </button>
        </div>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}  
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings} 
          icon={Clock}
        />  
        <StatCard
          title="Completed Bookings"
          value={stats.completedBookings}
          icon={Users}
        />
      </div>
      
      {/* Optional Services Popularity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background-light dark:bg-stone-800 rounded-lg p-6 border border-border-light dark:border-stone-700">
          <h3 className="text-lg font-semibold mb-4 text-content-dark dark:text-white">
            Popular Optional Services  
          </h3>
          <div className="space-y-4">
            {stats.popularOptionalServices?.map((service, index) => (
              <div key={service.name} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-content-dark dark:text-white">
                    {index + 1}
                  </span>
                  <span className="text-content-DEFAULT dark:text-white">{service.name}</span>  
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-content-light dark:text-stone-400">{service.popularity}</span>
                </div>
              </div>
            ))}  
          </div>
        </div>

        {/* Popular Scents */}
        <div className="bg-background-light dark:bg-stone-800 rounded-lg p-6 border border-border-light dark:border-stone-700">
          <h3 className="text-lg font-semibold mb-4 text-content-dark dark:text-white">
            Popular Scents 
          </h3>
          <div className="space-y-4">
            {stats.popularScents?.map((scent, index) => (
              <div key={scent.name} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-content-dark dark:text-white">
                    {index + 1}  
                  </span>
                  <span className="text-content-DEFAULT dark:text-white">{scent.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wind className="w-4 h-4 text-blue-500" />
                  <span className="text-content-light dark:text-stone-400">{scent.popularity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Appointments */}  
      <div className="mt-6">
        <WeeklyAppointments />
      </div>

    </div>
  );
};

export default Dashboard;