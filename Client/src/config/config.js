export const CONFIG = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    ENDPOINTS: {
      AUTH: {
        LOGIN: '/auth/login',
      },
      ADMIN: {
        DASHBOARD: '/admin/dashboard',
        BOOKINGS: {
          BASE: '/admin/bookings',
          DELETE_ALL: '/admin/bookings/delete-all'
        }
      },
      CONFIG: {
        BASE: (type) => `/config/${type}`,
      BY_ID: (type, id) => `/config/${type}/${id}`,
        VEHICLE_TYPES: '/config/vehicle-types',
        VEHICLE_TYPE_BY_ID: (id) => `/config/vehicle-types/${id}`,
        SCENTS: '/config/scents',
        SCENT_BY_ID: (id) => `/config/scents/${id}`,
        OPTIONAL_SERVICES: '/config/optional-services',
        OPTIONAL_SERVICE_BY_ID: (id) => `/config/optional-services/${id}`,
      },
      SERVICES: {
        BASE: '/services',
        BY_ID: (id) => `/services/${id}`,
        CHECK_NAME: '/services/check-name',
      },
      BOOKINGS: {
        BASE: '/bookings',
        PDF: (id) => `/bookings/${id}/pdf`,
        RESEND_EMAIL: (id) => `/bookings/${id}/resend-email`,
        UPDATE_STATUS: (id) => `/bookings/${id}/status`, // Add this line
      }
    }
  };