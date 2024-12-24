// src/components/admin/layout/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navigationItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Calendar size={20} />, label: 'Bookings', path: '/admin/bookings' },
    { icon: <Settings size={20} />, label: 'Services', path: '/admin/services' },
  ];

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background-light rounded-md border border-border-light shadow-sm"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-background-DEFAULT border-r border-border-light
        transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="p-6 border-b border-border-light">
          <h1 className="text-2xl font-bold text-primary-light">Admin Panel</h1>
          <p className="text-sm text-content-light mt-2">Manage your services and bookings</p>
        </div>

        <nav className="mt-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-6 py-3 text-sm transition-colors
                ${isCurrentPath(item.path) 
                  ? 'bg-primary-light/10 text-primary-dark border-r-2 border-primary-light' 
                  : 'text-content-DEFAULT hover:bg-background-dark'}
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className={`lg:ml-64 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;