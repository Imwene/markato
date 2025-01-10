// src/controllers/availabilityController.js
import { Availability } from '../models/availabilityModel.js';
import { Booking } from '../models/bookingModel.js';

export const getAvailability = async (req, res) => {
  try {
    const availability = await Availability.find();
    
    // Format the response
    const blockedDates = availability
      .filter(a => a.isBlocked)
      .map(a => a.date);
    
    const blockedTimeSlots = availability
      .reduce((acc, a) => ({
        ...acc,
        [a.date]: a.blockedTimeSlots
      }), {});

    res.json({
      success: true,
      data: {
        blockedDates,
        blockedTimeSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const toggleDateBlock = async (req, res) => {
  try {
    const { date } = req.body;
    
    let availability = await Availability.findOne({ date });
    
    if (!availability) {
      availability = new Availability({
        date,
        isBlocked: true
      });
    } else {
      availability.isBlocked = !availability.isBlocked;
    }

    await availability.save();

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const toggleTimeSlot = async (req, res) => {
  try {
    const { date, time } = req.body;
    
    let availability = await Availability.findOne({ date });
    
    if (!availability) {
      availability = new Availability({
        date,
        blockedTimeSlots: [time]
      });
    } else {
      if (availability.blockedTimeSlots.includes(time)) {
        availability.blockedTimeSlots = availability.blockedTimeSlots
          .filter(t => t !== time);
      } else {
        availability.blockedTimeSlots.push(time);
      }
    }

    await availability.save();

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};