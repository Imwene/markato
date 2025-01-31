import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { Suspense, lazy, useEffect } from "react";
import { ServicesProvider } from "./context/ServicesContext";
import { ConfigProvider } from "./context/ConfigContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ThemeToggle from "./components/ui/ThemeToggle";
import CommunicationTerms from "./components/CommunticationTerms";

// Eagerly load critical components
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { performanceMonitor } from "./utils/performance";
import { cacheManager } from "./utils/performance";

// Lazy load non-critical components
const Login = lazy(() => import("./components/admin/Login"));
const AdminRoutes = lazy(() => import("./routes/admin"));
const HeroSection = lazy(() => import("./components/HeroSection"));
const FeatureSection = lazy(() => import("./components/FeatureSection"));
const Workflow = lazy(() => import("./components/Workflow"));
const Footer = lazy(() => import("./components/Footer"));
const BookingComponent = lazy(() =>
  import("./components/booking/BookingComponent")
);
const BusinessMap = lazy(() => import("./components/BusinessMap"));
const CancellationPage = lazy(() => import("./components/CancellationPage"));

// Main layout for the site
const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto pt-10 px-6">
        {children}
      </div>
      <Footer />
    </>
  );
};

// App.jsx with the main layout
const App = () => {
  useEffect(() => {
    performanceMonitor.startTiming("appMount");
    return () => {
      const duration = performanceMonitor.endTiming("appMount");
      performanceMonitor.logPerformance({
        metric: "appMount",
        duration,
      });
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      cacheManager.clearExpired();
    }, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ConfigProvider>
          <ServicesProvider>
            <Suspense
              fallback={
                <div className="flex justify-center items-center min-h-screen">
                  <LoadingSpinner />
                </div>
              }
            >
              <ThemeToggle />
              <Routes>
                <Route path="/login" element={<Login />} />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminRoutes />
                    </ProtectedRoute>
                  }
                />

                {/* Main Site Routes */}
                <Route
                  path="/"
                  element={
                    <MainLayout>
                      <HeroSection />
                      <div className="mb-10" id="booking-section">
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mb-6 tracking-wide">
                          Book Your Service
                        </h2>
                        <BookingComponent />
                      </div>
                      <div id="workflow-section" className="mb-10">
                        <Workflow />
                      </div>
                      <FeatureSection />
                      <BusinessMap />
                    </MainLayout>
                  }
                />

                {/* Cancellation Page */}
                <Route
                  path="/cancel-booking/:confirmationNumber/:email"
                  element={
                    <MainLayout>
                      <CancellationPage />
                    </MainLayout>
                  }
                />

                {/* Communication Terms */}
                <Route
                  path="/communication-terms"
                  element={
                    <MainLayout>
                      <CommunicationTerms />
                    </MainLayout>
                  }
                />
                
                {/* 404 Route */}
                <Route
                  path="*"
                  element={
                    <MainLayout>
                      <div className="min-h-[60vh] flex flex-col items-center justify-center">
                        <h1 className="text-4xl font-bold text-content-dark dark:text-white mb-4">
                          Page Not Found
                        </h1>
                        <p className="text-content-light dark:text-stone-400 mb-8">
                          The page you're looking for doesn't exist.
                        </p>
                        <Link
                          to="/"
                          className="px-6 py-3 bg-primary-light dark:bg-orange-500 text-white rounded-lg 
                                   hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors"
                        >
                          Return Home
                        </Link>
                      </div>
                    </MainLayout>
                  }
                />
              </Routes>
            </Suspense>
          </ServicesProvider>
        </ConfigProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;