// src/components/admin/layout/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  Sliders,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const navigationItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/admin" },
    {
      icon: <Calendar size={20} />,
      label: "Bookings",
      path: "/admin/bookings",
    },
    {
      icon: <Settings size={20} />,
      label: "Services",
      path: "/admin/services",
    },
    {
      icon: <Sliders size={20} />,
      label: "Configurations",
      path: "/admin/config",
    },
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-stone-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 
        bg-background-light dark:bg-stone-800 rounded-md 
        border border-border-light dark:border-stone-700 shadow-sm"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full w-64 
        bg-background-DEFAULT dark:bg-stone-900 
        border-r border-border-light dark:border-stone-800
        transition-transform duration-300 ease-in-out z-40
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0
      `}
      >
        <div className="p-6 border-b border-border-light dark:border-stone-800">
          <h1 className="text-2xl font-bold text-primary-light dark:text-orange-500">
            Admin Panel
          </h1>
          <p className="text-sm text-content-light dark:text-stone-400">
            Manage your services and bookings
          </p>
        </div>

        <nav className="mt-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
              flex items-center gap-3 px-6 py-3 text-sm transition-colors
              ${
                isCurrentPath(item.path)
                  ? "bg-primary-light/10 text-primary-dark border-r-2 border-primary-light dark:bg-orange-500/10 dark:text-orange-500 dark:border-orange-500"
                  : "text-content-DEFAULT hover:bg-background-dark dark:text-stone-400 dark:hover:bg-stone-800"
              }
            `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          {user && ( // Conditionally render the logout button
            <button
              onClick={logout}
              className="flex items-center gap-3 px-6 py-3 text-sm 
              text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 
              transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          )}
        </nav>
      </div>

      {/* Main content */}
      <div
        className={`lg:ml-64 min-h-screen transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
