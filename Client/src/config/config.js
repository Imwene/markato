export const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",

  MOBILE_SERVICE: {
    UPCHARGE: 50,
    SERVICE_RADIUS: 15, // Updated from 40 to 15 miles
    DEPOSIT_PERCENTAGE: 0.5, // 50%
    STORE_ADDRESS: "1901 Park Blvd, Oakland, CA 94606",
    STORE_COORDINATES: {
      lat: 37.8044,
      lng: -122.2712,
    },
    // East Bay region boundaries and allowed areas
    EAST_BAY_REGION: {
      // Primary East Bay cities that are definitely serviced
      ALLOWED_CITIES: [
        'Oakland', 'Berkeley', 'Alameda', 'Emeryville', 'Piedmont',
        'Albany', 'El Cerrito', 'Richmond', 'San Leandro', 'Castro Valley',
        'Hayward', 'Union City', 'Fremont', 'Newark', 'Milpitas',
        'San Lorenzo', 'Ashland', 'Cherryland', 'Dublin', 'Pleasanton',
        'Livermore', 'Danville', 'San Ramon', 'Walnut Creek', 'Concord',
        'Martinez', 'Pleasant Hill', 'Lafayette', 'Orinda', 'Moraga'
      ],
      // Cities/areas explicitly excluded (West Bay/Peninsula)
      EXCLUDED_CITIES: [
        'San Francisco', 'Daly City', 'South San Francisco', 'Brisbane',
        'Millbrae', 'Burlingame', 'San Mateo', 'Foster City', 'Belmont',
        'San Carlos', 'Redwood City', 'Menlo Park', 'Palo Alto',
        'Mountain View', 'Sunnyvale', 'Santa Clara', 'San Jose',
        'Cupertino', 'Campbell', 'Los Gatos', 'Saratoga'
      ],
      // Rough boundary coordinates for East Bay (simplified polygon)
      BOUNDARY_COORDINATES: {
        // These coordinates roughly define the East Bay service area
        north: 38.1, // Richmond area
        south: 37.4, // Fremont area  
        east: -121.7, // Livermore area
        west: -122.3, // Bay shoreline
      }
    }
  },
  
  SQUARE: {
    APP_ID: import.meta.env.VITE_SQUARE_APP_ID,
    LOCATION_ID: import.meta.env.VITE_SQUARE_LOCATION_ID,
  },
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
    },
    ADMIN: {
      DASHBOARD: "/admin/dashboard",
      BOOKINGS: {
        BASE: "/admin/bookings",
        DELETE_ALL: "/admin/bookings/delete-all",
        WEEKLY: "/admin/bookings/weekly",
      },
    },
    CONFIG: {
      BASE: (type) => `/config/${type}`,
      BY_ID: (type, id) => `/config/${type}/${id}`,
      VEHICLE_TYPES: "/config/vehicle-types",
      VEHICLE_TYPE_BY_ID: (id) => `/config/vehicle-types/${id}`,
      SCENTS: "/config/scents",
      SCENT_BY_ID: (id) => `/config/scents/${id}`,
      OPTIONAL_SERVICES: "/config/optional-services",
      OPTIONAL_SERVICE_BY_ID: (id) => `/config/optional-services/${id}`,
      BUSINESS_SETTINGS: "/config/business-settings",
    },
    SERVICES: {
      BASE: "/services",
      BY_ID: (id) => `/services/${id}`,
      CHECK_NAME: "/services/check-name",
    },
    BOOKINGS: {
      BASE: "/bookings",
      PDF: (id) => `/bookings/${id}/pdf`,
      RESEND_EMAIL: (id) => `/bookings/${id}/resend-email`,
      UPDATE_STATUS: (id) => `/bookings/${id}/status`, // Add this line
      VALIDATE_ADDRESS: "/bookings/validate-address",
    },
  },
};
