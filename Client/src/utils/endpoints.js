// src/endpoints.js
export const API_ENDPOINTS = {
    config: {
      vehicleTypes: {
        base: `${import.meta.env.VITE_API_URL}/config/vehicle-types`,
        byId: (id) => `${import.meta.env.VITE_API_URL}/config/vehicle-types/${id}`,
      },
      scents: {
        base: `${import.meta.env.VITE_API_URL}/config/scents`,
        byId: (id) => `${import.meta.env.VITE_API_URL}/config/scents/${id}`,
      },
      optionalServices: {
        base: `${import.meta.env.VITE_API_URL}/config/optional-services`,
        byId: (id) => `${import.meta.env.VITE_API_URL}/config/optional-services/${id}`,
      },
    },
  };