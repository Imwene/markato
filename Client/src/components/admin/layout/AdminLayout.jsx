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
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/admin",
      description: "Overview of your business",
    },
    {
      icon: <Calendar size={20} />,
      label: "Bookings",
      path: "/admin/bookings",
      description: "Manage customer bookings",
    },
    {
      icon: <Settings size={20} />,
      label: "Services",
      path: "/admin/services",
      description: "Configure available services",
    },
    {
      icon: <Sliders size={20} />,
      label: "Configurations",
      path: "/admin/config",
      description: "System settings and options",
    },
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-stone-900">
      {/* Mobile menu button */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 
        bg-background-light dark:bg-stone-900 
        border-b border-border-light dark:border-stone-800 
        px-4 py-3 flex items-center"
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-background-dark dark:hover:bg-stone-800 rounded-lg
          text-content-DEFAULT dark:text-white transition-colors"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="ml-4 font-semibold text-content-dark dark:text-white">
          {navigationItems.find((item) => isCurrentPath(item.path))?.label ||
            "Admin Panel"}
        </span>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
    fixed top-0 left-0 h-full w-64 
    bg-white dark:bg-stone-900 
    border-r border-border-light dark:border-stone-800
    transition-all duration-300 ease-in-out
    z-40 lg:z-30
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    ${isMobile ? "shadow-xl" : ""}
    lg:translate-x-0
  `}
      >
        <div className="p-6 border-b border-border-light dark:border-stone-800 bg-white dark:bg-stone-900">
          <h1 className="text-2xl font-bold text-primary-light dark:text-orange-500">
            Admin Panel
          </h1>
          <p className="text-sm text-content-light dark:text-stone-400">
            Manage your services and bookings
          </p>
        </div>

        <nav className="mt-6 flex flex-col h-[calc(100%-160px)] bg-white dark:bg-stone-900">
          <div className="flex-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
            group flex items-center gap-3 px-6 py-3 text-sm transition-all relative
            hover:bg-gray-50 dark:hover:bg-stone-800
            ${
              isCurrentPath(item.path)
                ? "bg-primary-light/10 text-primary-dark border-r-2 border-primary-light dark:bg-orange-500/10 dark:text-orange-500 dark:border-orange-500"
                : "text-content-DEFAULT dark:text-stone-400"
            }
          `}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                <ChevronRight
                  className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity
                    ${
                      isCurrentPath(item.path)
                        ? "text-primary-light dark:text-orange-500"
                        : ""
                    }
                  `}
                />

                {/* Hover tooltip with description
                <div
                  className="absolute left-full ml-2 p-2 bg-background-DEFAULT dark:bg-stone-800 
                  rounded-md shadow-lg border border-border-light dark:border-stone-700
                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                  whitespace-nowrap z-50"
                >
                  {item.description}
                </div> */}
              </Link>
            ))}
          </div>

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-6 py-3 text-sm 
          text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 
          transition-colors mt-auto mb-6"
            >
              <LogOut size={20} />
              Logout
            </button>
          )}
        </nav>
      </div>

      {/* Main content */}
      <div
        className={`
          transition-all duration-300
          ${isMobile ? "pt-16" : ""}
          ${isSidebarOpen && !isMobile ? "lg:ml-64" : ""}
        `}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
