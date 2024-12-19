// src/context/ServicesContext.jsx
import { createContext, useState, useEffect } from 'react';

export const ServicesContext = createContext(null);

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/services');
      const data = await response.json();
      
      if (data.success) {
        const transformedServices = data.data
          //.filter(service => service.category === 'DRIVE-IN' && service.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(service => ({
            id: service._id,
            name: service.name,
            features: service.features,
            vehiclePricing: service.vehiclePricing,
            category: service.category
          }));
        
        setServices(transformedServices);
      } else {
        setError('Failed to fetch services');
      }
    } catch (error) {
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <ServicesContext.Provider 
      value={{
        services,
        loading,
        error,
        refreshServices: fetchServices
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};