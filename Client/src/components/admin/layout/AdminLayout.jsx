// src/components/admin/layout/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { logout, user } = useAuth();
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
    <div className="min-h-screen bg-neutral-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-800 rounded-md"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-neutral-800 text-white transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-orange-500">Admin Panel</h1>
          <p className="text-sm text-neutral-400 mt-2">{user?.email}</p>
        </div>

        <nav className="mt-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-6 py-3 text-sm
                ${isCurrentPath(item.path) 
                  ? 'bg-orange-500 text-white' 
                  : 'text-neutral-300 hover:bg-neutral-700'}
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-6 py-3 text-sm text-neutral-300 hover:bg-neutral-700 mt-auto absolute bottom-8 w-full"
        >
          <LogOut size={20} />
          Logout
        </button>
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