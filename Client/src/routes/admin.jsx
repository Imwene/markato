// src/routes/admin.jsx
import { Routes, Route } from 'react-router-dom';
import { ServicesProvider } from '../context/ServicesContext';
import AdminLayout from '../components/admin/layout/AdminLayout';
import AdminDashboard from '../components/admin/dashboard/Dashboard';
import BookingManager from '../components/admin/bookings/BookingManager';
import ServiceManager from '../components/admin/services/ServiceManager';

const AdminRoutes = () => {
  return (
    <ServicesProvider>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/bookings" element={<BookingManager />} />
          <Route path="/services" element={<ServiceManager />} />
          
        </Route>
      </Routes>
    </ServicesProvider>
  );
};

export default AdminRoutes;