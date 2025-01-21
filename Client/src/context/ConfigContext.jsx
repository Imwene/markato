import { createContext, useState, useEffect } from "react";
import { CONFIG } from "../config/config";

export const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [scents, setScents] = useState([]);
  const [optionalServices, setOptionalServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all config data in parallel with Promise.allSettled
      const [vehicleTypesResult, scentsResult, optionalServicesResult] =
        await Promise.allSettled([
          fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.VEHICLE_TYPES}`)
            .then((res) => res.json()),
          fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.SCENTS}`)
            .then((res) => res.json()),
          fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.CONFIG.OPTIONAL_SERVICES}`)
            .then((res) => res.json()),
        ]);

      // Handle results individually
      if (
        vehicleTypesResult.status === "fulfilled" &&
        vehicleTypesResult.value.success
      ) {
        setVehicleTypes(vehicleTypesResult.value.data);
      } else {
        console.error(
          "Failed to load vehicle types:",
          vehicleTypesResult.reason
        );
      }

      if (scentsResult.status === "fulfilled" && scentsResult.value.success) {
        setScents(scentsResult.value.data);
      } else {
        console.error("Failed to load scents:", scentsResult.reason);
      }

      if (
        optionalServicesResult.status === "fulfilled" &&
        optionalServicesResult.value.success
      ) {
        setOptionalServices(optionalServicesResult.value.data);
      } else {
        console.error(
          "Failed to load optional services:",
          optionalServicesResult.reason
        );
      }

      // Check if any requests failed
      const failures = [
        vehicleTypesResult,
        scentsResult,
        optionalServicesResult,
      ]
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

      if (failures.length > 0) {
        throw new Error("Some configuration data failed to load");
      }
    } catch (error) {
      setError(error.message);
      console.error("Config loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      if (isMounted) {
        await fetchConfig();
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    vehicleTypes: vehicleTypes.filter((type) => type.isActive),
    scents: scents.filter((scent) => scent.isActive),
    optionalServices: optionalServices.filter((service) => service.isActive),
    loading,
    error,
    refreshConfig: fetchConfig,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        <p className="mb-2">Error loading configuration: {error}</p>
        <button
          onClick={fetchConfig}
          className="mt-2 px-4 py-2 bg-primary-light dark:bg-orange-500 text-white rounded-lg hover:bg-primary-DEFAULT dark:hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};