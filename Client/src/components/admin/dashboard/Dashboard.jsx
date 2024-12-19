// src/components/admin/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    dailyBookings: []
  });

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/admin/dashboard');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-neutral-800 rounded-lg">
          <h3 className="text-lg text-neutral-400">Total Bookings</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalBookings}</p>
        </div>
        <div className="p-6 bg-neutral-800 rounded-lg">
          <h3 className="text-lg text-neutral-400">Pending Bookings</h3>
          <p className="text-3xl font-bold mt-2">{stats.pendingBookings}</p>
        </div>
        <div className="p-6 bg-neutral-800 rounded-lg">
          <h3 className="text-lg text-neutral-400">Completed Bookings</h3>
          <p className="text-3xl font-bold mt-2">{stats.completedBookings}</p>
        </div>
      </div>

      {/* Bookings Chart */}
      <div className="h-[400px] bg-neutral-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Bookings</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.dailyBookings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="bookings" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Bookings */}
      <div className="bg-neutral-800 rounded-lg">
        <h3 className="text-lg font-semibold p-6 border-b border-neutral-700">
          Recent Bookings
        </h3>
        <div className="divide-y divide-neutral-700">
          {stats.recentBookings.map((booking) => (
            <div key={booking.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-sm text-neutral-400">{booking.service}</p>
                </div>
                <span className="text-sm text-neutral-400">{booking.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;