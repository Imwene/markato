// src/context/ConfigContext.jsx
import { createContext, useState, useEffect } from 'react';
import { CONFIG } from '../config/config';

export const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [scents, setScents] = useState([]);
  const [optionalServices, setOptionalServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchWithRetry = async (url, retryDelay = 1000) => {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        // If we get rate limited, wait and retry
        if (retryCount < 3) { // Max 3 retries
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          setRetryCount(prev => prev + 1);
          return fetchWithRetry(url, retryDelay * 2); // Exponential backoff
        } else {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all config data sequentially to avoid rate limiting
        const vehicleTypesData = await fetchWithRetry(
          `${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.VEHICLE_TYPES}`
        );
        if (!isMounted) return;
        
        const scentsData = await fetchWithRetry(
          `${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.SCENTS}`
        );
        if (!isMounted) return;
        
        const optionalServicesData = await fetchWithRetry(
          `${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.OPTIONAL_SERVICES}`
        );
        if (!isMounted) return;

        if (vehicleTypesData.success) setVehicleTypes(vehicleTypesData.data);
        if (scentsData.success) setScents(scentsData.data);
        if (optionalServicesData.success) setOptionalServices(optionalServicesData.data);

      } catch (error) {
        if (isMounted) {
          setError(error.message);
          console.error('Config loading error:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run on mount

  const refreshConfig = async () => {
    setRetryCount(0); // Reset retry count
    try {
      setLoading(true);
      setError(null);

      const vehicleTypesData = await fetchWithRetry(
        `${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.VEHICLE_TYPES}`
      );
      const scentsData = await fetchWithRetry(
        `${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.SCENTS}`
      );
      const optionalServicesData = await fetchWithRetry(
        `${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.OPTIONAL_SERVICES}`
      );

      if (vehicleTypesData.success) setVehicleTypes(vehicleTypesData.data);
      if (scentsData.success) setScents(scentsData.data);
      if (optionalServicesData.success) setOptionalServices(optionalServicesData.data);

    } catch (error) {
      setError(error.message);
      console.error('Config refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    vehicleTypes: vehicleTypes.filter(type => type.isActive),
    scents: scents.filter(scent => scent.isActive),
    optionalServices: optionalServices.filter(service => service.isActive),
    loading,
    error,
    refreshConfig
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">
      Error loading configuration: {error}
    </div>;
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};