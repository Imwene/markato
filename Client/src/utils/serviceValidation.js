// src/utils/serviceValidation.js

export const checkServiceName = async (name, excludeId = null) => {
  try {
    const response = await fetch(
      `${CONFIG.API_URL}${
        CONFIG.ENDPOINTS.SERVICES.CHECK_NAME
      }?name=${encodeURIComponent(name)}${
        excludeId ? `&excludeId=${excludeId}` : ""
      }`
    );

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking service name:", error);
    return false;
  }
};

// Optional: If you want a more comprehensive validation function
export const validateServiceData = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = "Service name is required";
  } else if (formData.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  // Features validation
  if (!formData.features?.length) {
    errors.features = "At least one feature is required";
  } else {
    const emptyFeatures = formData.features.some((f) => !f.trim());
    if (emptyFeatures) {
      errors.features = "Features cannot be empty";
    }
  }

  // Pricing validation
  const pricing = formData.vehiclePricing || {};
  if (
    !pricing.sedan ||
    !pricing["mini-suv"] ||
    !pricing.suv ||
    !pricing["van/truck"]
  ) {
    errors.vehiclePricing = "All vehicle prices are required";
  } else {
    const invalidPrices = Object.entries(pricing).some(
      ([_, price]) => isNaN(price) || price <= 0
    );
    if (invalidPrices) {
      errors.vehiclePricing = "All prices must be valid numbers greater than 0";
    }
  }

  // Category validation
  if (!["DRIVE-IN", "APPOINTMENT"].includes(formData.category)) {
    errors.category = "Invalid service category";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
