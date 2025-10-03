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
    const { unavailableDay } = req.body;

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

    const updated = await BusinessSettings.findOneAndUpdate(
      {},
      { unavailableDay: unavailableDay === "" ? null : unavailableDay },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
