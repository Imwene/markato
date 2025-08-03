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
