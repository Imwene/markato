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

const Dashboard = () => {
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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/dashboard");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
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

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-background-light p-6 rounded-lg border border-border-light">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-content-light text-sm">{title}</p>
          <p className="text-2xl font-bold text-content-dark mt-2">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% from last week
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-light/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary-DEFAULT" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-dark">Dashboard</h1>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 text-sm bg-primary-light text-white rounded-lg hover:bg-primary-DEFAULT transition-colors"
        >
          Refresh Data
        </button>
        <button
          onClick={async () => {
            if (
              window.confirm(
                "Are you sure you want to delete ALL bookings? This action cannot be undone."
              )
            ) {
              try {
                const response = await fetch(
                  "http://localhost:8080/api/admin/bookings/delete-all",
                  {
                    method: "DELETE",
                  }
                );
                const data = await response.json();

                if (data.success) {
                  // Refresh the dashboard/booking list
                  fetchDashboardStats(); // or whatever refresh function you're using
                  alert("All bookings have been deleted successfully");
                }
              } catch (error) {
                console.error("Error deleting bookings:", error);
                alert("Failed to delete bookings");
              }
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Delete All Bookings
        </button>
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

      {/* Bookings Chart */}
      <div className="h-[400px] bg-background-light rounded-lg p-6 border border-border-light">
        <h3 className="text-lg font-semibold mb-4 text-content-dark">
          Daily Bookings
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.dailyBookings}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              tick={{ fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "#0f172a" }}
            />
            <Bar dataKey="bookings" fill="#0cc0df" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Bookings */}
      <div className="bg-background-light rounded-lg border border-border-light">
        <div className="p-6 border-b border-border-light">
          <h3 className="text-lg font-semibold text-content-dark">
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
