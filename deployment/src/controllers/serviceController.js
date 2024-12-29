// src/controllers/serviceController.js
import Service from '../models/serviceModel.js';
import Booking from '../models/bookingModel.js';
export async function getAllServices(req, res) {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1 });
      
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getServiceById(req, res) {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function createService(req, res) {
  try {
    const service = new Service(req.body);
    await service.save();
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function updateService(req, res) {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function deleteService(req, res) {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}export const checkServiceName = async (req, res) => {
    try {
      const { name, excludeId } = req.query;
  
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Service name is required'
        });
      }
  
      const query = {
        name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive exact match
        isActive: true
      };
  
      // If excludeId is provided, exclude that service from the check
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
  
      const existingService = await Service.findOne(query);
  
      res.json({
        success: true,
        exists: !!existingService
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
  
  export const checkServiceBookings = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Service ID is required'
        });
      }
  
      // Check for any bookings using this service
      const bookingsCount = await Booking.countDocuments({
        serviceId: id,
        status: { 
          $nin: ['cancelled', 'completed'] // Only check active bookings
        }
      });
  
      res.json({
        success: true,
        hasBookings: bookingsCount > 0,
        count: bookingsCount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };