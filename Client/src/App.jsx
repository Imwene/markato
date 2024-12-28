import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy, useEffect } from 'react';
import { ServicesProvider } from "./context/ServicesContext";
import { ConfigProvider } from "./context/ConfigContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Eagerly load critical components
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { performanceMonitor } from './utils/performance';

// In your App.jsx

// Lazy load non-critical components
const Login = lazy(() => import("./components/admin/Login"));
const AdminRoutes = lazy(() => import("./routes/admin"));
const HeroSection = lazy(() => import("./components/HeroSection"));
const FeatureSection = lazy(() => import("./components/FeatureSection"));
const Workflow = lazy(() => import("./components/Workflow"));
const Footer = lazy(() => import("./components/Footer"));
const BookingComponent = lazy(() => import("./components/booking/BookingComponent"));
const BusinessMap = lazy(() => import("./components/BusinessMap"));

const App = () => {

  useEffect(() => {
    performanceMonitor.startTiming('appMount');
    return () => {
      const duration = performanceMonitor.endTiming('appMount');
      performanceMonitor.logPerformance({
        metric: 'appMount',
        duration
      });
    };
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      cacheManager.clearExpired();
    }, 1000 * 60 * 60); // Run every hour
  
    return () => clearInterval(interval);
  }, []);
  

  return (
    <Router>
      <AuthProvider>
        <ConfigProvider>
          <ServicesProvider>
            <Suspense fallback={
              <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
              </div>
            }>
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
                    <>
                      <Navbar />
                      <div className="max-w-7xl mx-auto pt-20 px-6">
                        <HeroSection />
                        <div className="mb-20" id="booking-section">
                          <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mb-10 tracking-wide">
                            Book Your Service
                          </h2>
                          <BookingComponent />
                        </div>
                        <div id="workflow-section" className="mb-20">
                          <Workflow />
                        </div>
                        <FeatureSection />
                        <BusinessMap/>
                        <Footer />
                      </div>
                    </>
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