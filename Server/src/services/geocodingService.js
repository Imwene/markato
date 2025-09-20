// src/services/geocodingService.js
import { Client } from "@googlemaps/google-maps-services-js";
import {
  calculateDistance,
  validateCoordinates,
} from "../utils/distanceCalculator.js";
import StoreConfig from "../models/storeConfigModel.js";

const client = new Client({});

/**
 * Geocode an address using Google Maps Geocoding API
 * @param {string} address - The address to geocode
 * @returns {Promise<object>} Object with coordinates and formatted address
 */
export const geocodeAddress = async (address) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    if (
      !address ||
      typeof address !== "string" ||
      address.trim().length === 0
    ) {
      throw new Error("Invalid address provided");
    }

    const response = await client.geocode({
      params: {
        address: address.trim(),
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== "OK" || response.data.results.length === 0) {
      throw new Error("Address not found or geocoding failed");
    }

    const result = response.data.results[0];
    const location = result.geometry.location;

    // Extract address components
    const addressComponents = result.address_components;
    const getComponent = (type) => {
      const component = addressComponents.find((comp) =>
        comp.types.includes(type)
      );
      return component ? component.long_name : "";
    };

    return {
      success: true,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
      formattedAddress: result.formatted_address,
      addressComponents: {
        street: `${getComponent("street_number")} ${getComponent(
          "route"
        )}`.trim(),
        city: getComponent("locality") || getComponent("sublocality"),
        state: getComponent("administrative_area_level_1"),
        zipCode: getComponent("postal_code"),
        country: getComponent("country"),
      },
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      success: false,
      error: error.message || "Failed to geocode address",
    };
  }
};

/**
 * Validate if coordinates are within the service area
 * @param {number} lat - Latitude of the target location
 * @param {number} lng - Longitude of the target location
 * @returns {Promise<object>} Object with validation result and distance
 */
export const validateServiceArea = async (lat, lng) => {
  try {
    // Validate coordinates
    if (!validateCoordinates(lat, lng)) {
      return {
        isValid: false,
        error: "Invalid coordinates provided",
        distance: null,
      };
    }

    // Get store configuration
    const storeConfig = await StoreConfig.findOne({ isActive: true });

    // Use default store location if no config found
    const storeLat =
      storeConfig?.address?.coordinates?.lat ||
      parseFloat(process.env.STORE_LAT) ||
      37.8044;
    const storeLng =
      storeConfig?.address?.coordinates?.lng ||
      parseFloat(process.env.STORE_LNG) ||
      -122.2712;
    const serviceRadius =
      storeConfig?.serviceRadius ||
      parseFloat(process.env.SERVICE_RADIUS) ||
      40;

    // Calculate distance from store
    const distance = calculateDistance(storeLat, storeLng, lat, lng);

    return {
      isValid: distance <= serviceRadius,
      distance: distance,
      serviceRadius: serviceRadius,
      storeLocation: {
        lat: storeLat,
        lng: storeLng,
      },
    };
  } catch (error) {
    console.error("Service area validation error:", error);
    return {
      isValid: false,
      error: error.message || "Failed to validate service area",
      distance: null,
    };
  }
};

/**
 * Combined function to geocode address and validate service area
 * @param {string} address - The address to validate
 * @returns {Promise<object>} Complete validation result
 */
export const validateAddressAndServiceArea = async (address) => {
  try {
    // First geocode the address
    const geocodeResult = await geocodeAddress(address);

    if (!geocodeResult.success) {
      return {
        success: false,
        error: geocodeResult.error,
        isValid: false,
      };
    }

    // Then validate service area
    const serviceAreaResult = await validateServiceArea(
      geocodeResult.coordinates.lat,
      geocodeResult.coordinates.lng
    );

    return {
      success: true,
      isValid: serviceAreaResult.isValid,
      distance: serviceAreaResult.distance,
      serviceRadius: serviceAreaResult.serviceRadius,
      coordinates: geocodeResult.coordinates,
      formattedAddress: geocodeResult.formattedAddress,
      addressComponents: geocodeResult.addressComponents,
      storeLocation: serviceAreaResult.storeLocation,
    };
  } catch (error) {
    console.error("Address validation error:", error);
    return {
      success: false,
      error: error.message || "Failed to validate address",
      isValid: false,
    };
  }
};
