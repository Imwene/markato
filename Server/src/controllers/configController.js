// src/controllers/configController.js
import { VehicleType } from "../models/vehicleTypeModel.js";
import { Scent } from "../models/scentModel.js";
import { OptionalService } from "../models/optionalServiceModel.js";
import { BusinessSettings } from "../models/businessSettingsModel.js";

// Vehicle Types Controllers
export const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await VehicleType.find().sort("sortOrder");
    res.json({ success: true, data: vehicleTypes });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createVehicleType = async (req, res) => {
  try {
    const vehicleType = new VehicleType(req.body);
    await vehicleType.save();
    res.status(201).json({
      success: true,
      data: vehicleType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateVehicleType = async (req, res) => {
  try {
    const vehicleType = await VehicleType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        error: "Vehicle type not found",
      });
    }

    res.json({
      success: true,
      data: vehicleType,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Scents Controllers
export const getScents = async (req, res) => {
  try {
    const scents = await Scent.find().sort("sortOrder");
    res.json({ success: true, data: scents });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createScent = async (req, res) => {
  try {
    const scent = new Scent(req.body);
    await scent.save();
    res.status(201).json({
      success: true,
      data: scent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateScent = async (req, res) => {
  try {
    const scent = await Scent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!scent) {
      return res.status(404).json({
        success: false,
        error: "Scent not found",
      });
    }

    res.json({
      success: true,
      data: scent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Optional Services Controllers
export const getOptionalServices = async (req, res) => {
  try {
    const optionalServices = await OptionalService.find().sort("sortOrder");
    res.json({ success: true, data: optionalServices });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createOptionalService = async (req, res) => {
  try {
    const service = new OptionalService(req.body);
    await service.save();
    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateOptionalService = async (req, res) => {
  try {
    const service = await OptionalService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Optional service not found",
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Business Settings Controllers
export const getBusinessSettings = async (req, res) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      // Create default settings document if it doesn't exist
      settings = await BusinessSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateBusinessSettings = async (req, res) => {
  try {
    const { unavailableDay, mobileDetailingEnabled, businessHours } = req.body;

    // Validate unavailableDay if provided
    if (
      unavailableDay !== null &&
      unavailableDay !== undefined &&
      (typeof unavailableDay !== "number" ||
        unavailableDay < 0 ||
        unavailableDay > 6)
    ) {
      return res.status(400).json({
        success: false,
        error: "unavailableDay must be a number between 0-6 or null",
      });
    }

    // Strict validation for mobileDetailingEnabled - must be a boolean
    if (mobileDetailingEnabled !== undefined && typeof mobileDetailingEnabled !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "mobileDetailingEnabled must be a boolean (true or false)",
      });
    }

    // Validate and normalize businessHours if provided
    let normalizedBusinessHours;
    if (businessHours !== undefined) {
      if (!Array.isArray(businessHours)) {
        return res.status(400).json({
          success: false,
          error: "businessHours must be an array of time strings",
        });
      }

      if (businessHours.length === 0) {
        return res.status(400).json({
          success: false,
          error: "businessHours must contain at least one time slot",
        });
      }

      // Validate each time string format (allows flexible input)
      const timeRegex = /^(1[0-2]|[1-9]):([0-5][0-9])\s?(AM|PM)$/i;
      const invalidTimes = businessHours.filter((time) => !timeRegex.test(time?.trim?.() || ""));
      if (invalidTimes.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid time format: ${invalidTimes.join(", ")}. Use format like '9:00 AM' or '12:30 PM'`,
        });
      }

      // Normalize time strings to canonical format: "H:MM AM" or "HH:MM PM"
      // - Trim whitespace
      // - Ensure single space before AM/PM
      // - Uppercase AM/PM
      const normalizeTime = (timeStr) => {
        const match = timeStr.trim().match(/^(1[0-2]|[1-9]):([0-5][0-9])\s?(AM|PM)$/i);
        if (!match) return timeStr; // Should not happen after validation
        const [, hours, minutes, period] = match;
        return `${hours}:${minutes} ${period.toUpperCase()}`;
      };

      // Helper to convert time to minutes for sorting
      const timeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      // Normalize, deduplicate, and sort
      normalizedBusinessHours = [...new Set(businessHours.map(normalizeTime))]
        .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
    }

    // Build update object with only provided fields
    const updateData = {};

    if (unavailableDay !== undefined) {
      updateData.unavailableDay = unavailableDay === "" ? null : unavailableDay;
    }

    if (mobileDetailingEnabled !== undefined) {
      updateData.mobileDetailingEnabled = mobileDetailingEnabled;
    }

    if (normalizedBusinessHours !== undefined) {
      updateData.businessHours = normalizedBusinessHours;
    }

    const updated = await BusinessSettings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
