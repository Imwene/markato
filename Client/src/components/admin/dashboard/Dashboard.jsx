import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import api from "../../../utils/api.js";
import { useNavigate } from "react-router-dom";
import { CONFIG } from "../../../config/config.js";
import ThemeToggle from "../../ui/ThemeToggle.jsx";
import WeeklyAppointments from "./WeeklyAppointments";

const Dashboard = () => {

  const isDark = ThemeToggle.isDark;

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    dailyBookings: [],
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
      
      // Using the api.get method instead of fetch
      const data = await api.get(CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      if (error.message === 'No token, authorization denied') {
        navigate('/login');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllBookings = async () => {
    if (window.confirm("Are you sure you want to delete ALL bookings? This action cannot be undone.")) {
      try {
        // Using the api.delete method
        const data = await api.delete(CONFIG.ENDPOINTS.ADMIN.BOOKINGS.DELETE_ALL);

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

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-background-light dark:bg-stone-800 p-6 rounded-lg 
                    border border-border-light dark:border-stone-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-content-light dark:text-stone-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-content-dark dark:text-white mt-2">
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 ${
              trend >= 0 ? "text-green-500 dark:text-green-400" : 
                          "text-red-500 dark:text-red-400"}`}>
              {trend >= 0 ? "+" : ""}
              {trend}% from last week
            </p>
          )}
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-dark">Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 text-sm bg-primary-light text-white rounded-lg hover:bg-primary-DEFAULT transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={handleDeleteAllBookings}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete All Bookings
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          trend={5}
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={Clock}
          trend={-2}
        />
        <StatCard
          title="Completed Bookings"
          value={stats.completedBookings}
          icon={Users}
          trend={8}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue || 0}`}
          icon={DollarSign}
          trend={12}
        />
      </div>

      <div className="mt-6">
        <WeeklyAppointments />
      </div>

      {/* Bookings Chart */}
      <div className="h-[400px] bg-background-light dark:bg-stone-800 rounded-lg p-6 
                border border-border-light dark:border-stone-700">
  <h3 className="text-lg font-semibold mb-4 text-content-dark dark:text-white">
    Daily Bookings
  </h3>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={stats.dailyBookings}>
      <CartesianGrid strokeDasharray="3 3" 
                     stroke="#e2e8f0" 
                     strokeOpacity={isDark ? 0.1 : 1} />
      <XAxis
        dataKey="date"
        tick={{ fill: isDark ? "#94a3b8" : "#64748b" }}
        axisLine={{ stroke: isDark ? "#334155" : "#cbd5e1" }}
      />
      <YAxis
        tick={{ fill: isDark ? "#94a3b8" : "#64748b" }}
        axisLine={{ stroke: isDark ? "#334155" : "#cbd5e1" }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: isDark ? "#1c1917" : "#ffffff",
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
          borderRadius: "0.5rem",
          color: isDark ? "#ffffff" : "#0f172a"
        }}
      />
      <Bar 
        dataKey="bookings" 
        fill={isDark ? "#f97316" : "#0cc0df"}
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>

      {/* Recent Bookings */}
      <div className="bg-background-light dark:bg-stone-800 rounded-lg 
                border border-border-light dark:border-stone-700">
  <div className="p-6 border-b border-border-light dark:border-stone-700">
    <h3 className="text-lg font-semibold text-content-dark dark:text-white">
      Recent Bookings
    </h3>
  </div>
        <div className="divide-y divide-border-light">
          {stats.recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-6 hover:bg-background-dark transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-content-DEFAULT">
                    {booking.customerName}
                  </p>
                  <p className="text-sm text-content-light mt-1">
                    {booking.service}
                  </p>
                  <p className="text-sm text-primary-DEFAULT mt-1">
                    ${booking.totalPrice}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                  <p className="text-sm text-content-light mt-2">
                    {booking.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;