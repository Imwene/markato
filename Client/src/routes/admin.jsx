// src/routes/admin.jsx
import { Routes, Route } from 'react-router-dom';
import { ServicesProvider } from '../context/ServicesContext';
import AdminLayout from '../components/admin/layout/AdminLayout';
import AdminDashboard from '../components/admin/dashboard/Dashboard';
import BookingManager from '../components/admin/bookings/BookingManager';
import ServiceManager from '../components/admin/services/ServiceManager';
import ConfigurationManager from '../components/admin/config/ConfigurationsManager';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

const AdminRoutes = () => {
  return (
    <ServicesProvider>
      <Routes>
        <Route element={
        <ProtectedRoute>
        <AdminLayout />
        </ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/bookings" element={<BookingManager />} />
          <Route path="/services" element={<ServiceManager />} />
          <Route path="/config" element={<ConfigurationManager />} />
        </Route>
      </Routes>
    </ServicesProvider>
  );
};

export default AdminRoutes;