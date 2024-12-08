import Booking from '../models/bookingModel.js';

export async function createBooking(req, res) {
  try {
    console.log('Received booking:', req.body);
    
    const basePrice = parseFloat(req.body.servicePrice);
    const optionalServicesTotal = (req.body.optionalServices || [])
      .reduce((total, service) => total + parseFloat(service.price), 0);
    const totalPrice = basePrice + optionalServicesTotal;
 
    const bookingData = {
      ...req.body,
      totalPrice,
      optionalServices: req.body.optionalServices || []
    };
     
    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    
    console.log('Saved booking:', savedBooking);

    res.status(201).json({
      success: true,
      data: savedBooking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .select('-__v');
      
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id).select('-__v');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}