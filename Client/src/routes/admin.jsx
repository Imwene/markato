// src/routes/admin.jsx
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/admin/layout/AdminLayout';
import AdminDashboard from '../components/admin/dashboard/Dashboard';
import AdminLogin from '../components/admin/auth/Login';
import BookingManager from '../components/admin/bookings/BookingManager';
import ServiceManager from '../components/admin/services/ServiceManager';
import { useAuth } from '../hooks/useAuth';

const AdminRoutes = () => {
  const { isAuthenticated } = useAuth();

  // Protect admin routes
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<BookingManager />} />
        <Route path="services" element={<ServiceManager />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  );
};

export default AdminRoutes;