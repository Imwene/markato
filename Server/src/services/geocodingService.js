// src/services/geocodingService.js
import { Client } from "@googlemaps/google-maps-services-js";
import {
  calculateDistance,
  validateCoordinates,
  validateEastBayLocation,
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

    if (response.data.status === "ZERO_RESULTS" || response.data.results.length === 0) {
      throw new Error("We couldn't find this address. Please check the spelling and include the full street address, city, and state.");
    }
    
    if (response.data.status !== "OK") {
      throw new Error(`Address lookup failed: ${response.data.status}. Please try again.`);
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
 * Validate if coordinates are within the service area (East Bay + distance)
 * @param {number} lat - Latitude of the target location
 * @param {number} lng - Longitude of the target location
 * @param {string} cityName - City name for region validation (optional)
 * @returns {Promise<object>} Object with validation result and distance
 */
export const validateServiceArea = async (lat, lng, cityName = null) => {
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
      15; // Updated default from 40 to 15 miles

    // Calculate distance from store
    const distance = calculateDistance(storeLat, storeLng, lat, lng);

    // Check if location is in East Bay region
    const eastBayValidation = validateEastBayLocation(lat, lng, cityName);

    // Location must be both in East Bay AND within distance radius
    const isValidDistance = distance <= serviceRadius;
    const isValidRegion = eastBayValidation.isInEastBay;
    const isValid = isValidDistance && isValidRegion;

    let validationStatus = "valid";
    let validationMessage = "";

    if (!isValidRegion) {
      validationStatus = "outside_east_bay";
      validationMessage = eastBayValidation.reason;
    } else if (!isValidDistance) {
      validationStatus = "outside_service_area";
      validationMessage = `Address is ${distance.toFixed(1)} miles away (outside our ${serviceRadius}-mile service area)`;
    }

    return {
      isValid: isValid,
      distance: distance,
      serviceRadius: serviceRadius,
      validationStatus: validationStatus,
      validationMessage: validationMessage,
      eastBayValidation: eastBayValidation,
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

    // Then validate service area (include city name for region validation)
    const serviceAreaResult = await validateServiceArea(
      geocodeResult.coordinates.lat,
      geocodeResult.coordinates.lng,
      geocodeResult.addressComponents.city
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
      // Pass through validation status and message for more informative errors
      validationStatus: serviceAreaResult.validationStatus,
      validationMessage: serviceAreaResult.validationMessage,
      eastBayValidation: serviceAreaResult.eastBayValidation,
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

/**
 * Get address predictions using Google Places Autocomplete API
 * @param {string} input - The input text to search for
 * @returns {Promise<object>} List of address predictions
 */
export const getAddressSuggestions = async (input) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key not configured");
    }

    if (!input || typeof input !== "string" || input.trim().length < 3) {
      return { success: true, predictions: [] };
    }

    const response = await client.placeAutocomplete({
      params: {
        input: input.trim(),
        key: process.env.GOOGLE_MAPS_API_KEY,
        components: ["country:us"], // Restrict to US
        // Bias towards Oakland/East Bay area (approximate)
        location: { lat: 37.8044, lng: -122.2712 },
        radius: 50000, // 50km radius bias
        strictbounds: false, // Allow results outside but bias inside
      },
    });

    if (
      response.data.status !== "OK" &&
      response.data.status !== "ZERO_RESULTS"
    ) {
      // ZERO_RESULTS is not an error, just empty list
      throw new Error(`Places API error: ${response.data.status}`);
    }

    const predictions = response.data.predictions || [];

    return {
      success: true,
      predictions: predictions.map((p) => ({
        description: p.description,
        placeId: p.place_id,
        mainText: p.structured_formatting?.main_text || "",
        secondaryText: p.structured_formatting?.secondary_text || "",
      })),
    };
  } catch (error) {
    console.error("Autocomplete error:", error);
    return {
      success: false,
      error: error.message || "Failed to get suggestions",
      predictions: [],
    };
  }
};
