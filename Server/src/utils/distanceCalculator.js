// src/utils/distanceCalculator.js

/**
 * Convert degrees to radians
 * @param {number} degrees - The angle in degrees
 * @returns {number} The angle in radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lon1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lon2 - Longitude of the second point
 * @returns {number} Distance in miles
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in miles

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Check if coordinates are within a specified radius of a center point
 * @param {number} centerLat - Center point latitude
 * @param {number} centerLon - Center point longitude
 * @param {number} targetLat - Target point latitude
 * @param {number} targetLon - Target point longitude
 * @param {number} radius - Maximum radius in miles
 * @returns {object} Object with isWithinRadius boolean and distance number
 */
export const isWithinRadius = (
  centerLat,
  centerLon,
  targetLat,
  targetLon,
  radius
) => {
  const distance = calculateDistance(
    centerLat,
    centerLon,
    targetLat,
    targetLon
  );

  return {
    isWithinRadius: distance <= radius,
    distance: distance,
  };
};

/**
 * Validate latitude and longitude values
 * @param {number} lat - Latitude value
 * @param {number} lng - Longitude value
 * @returns {boolean} True if valid coordinates
 */
export const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

/**
 * Check if coordinates are within the East Bay region
 * @param {number} lat - Latitude of the location
 * @param {number} lng - Longitude of the location
 * @returns {boolean} True if location is in East Bay region
 */
export const isInEastBay = (lat, lng) => {
  // East Bay boundary coordinates (approximate)
  const eastBayBounds = {
    north: 38.1,   // Richmond area
    south: 37.4,   // Fremont area
    east: -121.7,  // Livermore area
    west: -122.3,  // Bay shoreline (excludes SF)
  };

  return (
    lat >= eastBayBounds.south &&
    lat <= eastBayBounds.north &&
    lng >= eastBayBounds.west &&
    lng <= eastBayBounds.east
  );
};

/**
 * Check if a city name is in the allowed East Bay cities list
 * @param {string} cityName - Name of the city
 * @returns {boolean} True if city is allowed
 */
export const isAllowedEastBayCity = (cityName) => {
  if (!cityName || typeof cityName !== 'string') return false;
  
  const allowedCities = [
    'Oakland', 'Berkeley', 'Alameda', 'Emeryville', 'Piedmont',
    'Albany', 'El Cerrito', 'Richmond', 'San Leandro', 'Castro Valley',
    'Hayward', 'Union City', 'Fremont', 'Newark', 'Milpitas',
    'San Lorenzo', 'Ashland', 'Cherryland', 'Dublin', 'Pleasanton',
    'Livermore', 'Danville', 'San Ramon', 'Walnut Creek', 'Concord',
    'Martinez', 'Pleasant Hill', 'Lafayette', 'Orinda', 'Moraga'
  ];
  
  return allowedCities.some(city => 
    cityName.toLowerCase().includes(city.toLowerCase()) ||
    city.toLowerCase().includes(cityName.toLowerCase())
  );
};

/**
 * Check if a city name is explicitly excluded (West Bay/Peninsula)
 * @param {string} cityName - Name of the city
 * @returns {boolean} True if city is excluded
 */
export const isExcludedCity = (cityName) => {
  if (!cityName || typeof cityName !== 'string') return false;
  
  const excludedCities = [
    'San Francisco', 'Daly City', 'South San Francisco', 'Brisbane',
    'Millbrae', 'Burlingame', 'San Mateo', 'Foster City', 'Belmont',
    'San Carlos', 'Redwood City', 'Menlo Park', 'Palo Alto',
    'Mountain View', 'Sunnyvale', 'Santa Clara', 'San Jose',
    'Cupertino', 'Campbell', 'Los Gatos', 'Saratoga'
  ];
  
  return excludedCities.some(city => 
    cityName.toLowerCase().includes(city.toLowerCase()) ||
    city.toLowerCase().includes(cityName.toLowerCase())
  );
};

/**
 * Comprehensive East Bay validation using multiple criteria
 * @param {number} lat - Latitude of the location
 * @param {number} lng - Longitude of the location
 * @param {string} cityName - Name of the city (optional)
 * @returns {object} Validation result with details
 */
export const validateEastBayLocation = (lat, lng, cityName = null) => {
  const result = {
    isInEastBay: false,
    reason: '',
    validationMethod: ''
  };

  // First check if city is explicitly excluded
  if (cityName && isExcludedCity(cityName)) {
    result.reason = `${cityName} is outside our East Bay service area (West Bay/Peninsula not serviced)`;
    result.validationMethod = 'excluded_city';
    return result;
  }

  // Check if city is in allowed list
  if (cityName && isAllowedEastBayCity(cityName)) {
    result.isInEastBay = true;
    result.reason = `${cityName} is within our East Bay service area`;
    result.validationMethod = 'allowed_city';
    return result;
  }

  // Fall back to coordinate-based validation
  if (isInEastBay(lat, lng)) {
    result.isInEastBay = true;
    result.reason = 'Location coordinates are within East Bay region';
    result.validationMethod = 'coordinates';
    return result;
  }

  // Default: not in East Bay
  result.reason = cityName 
    ? `${cityName} is outside our East Bay service area`
    : 'Location is outside our East Bay service area';
  result.validationMethod = 'coordinates';
  return result;
};
