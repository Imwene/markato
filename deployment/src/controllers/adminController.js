// src/controllers/adminController.js
import Booking from '../models/bookingModel.js';

// Dashboard Stats

export const getDashboardStats = async (req, res) => {
  try {
    // Get today's date and last 7 days
    const today = new Date();
    const last7Days = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Get counts
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Calculate total revenue
    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Get daily bookings for the last 7 days
    const dailyBookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          bookings: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          bookings: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name serviceName totalPrice status dateTime')
      .lean();

    // Format recent bookings
    const formattedRecentBookings = recentBookings.map(booking => {
      // Parse the date string "Tue, Dec 24, 2024, 9:00 AM"
      try {
        const dateTime = new Date(booking.dateTime.replace(/, (\d)/g, ' $1'));
        
        return {
          id: booking._id,
          customerName: booking.name,
          service: booking.serviceName,
          totalPrice: booking.totalPrice,
          status: booking.status,
          date: dateTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          time: dateTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          confirmationNumber: booking.confirmationNumber
        };
      } catch (error) {
        console.error('Date parsing error for booking:', booking._id, error);
        return {
          id: booking._id,
          customerName: booking.name,
          service: booking.serviceName,
          totalPrice: booking.totalPrice,
          status: booking.status,
          date: 'Invalid Date',
          time: 'Invalid Time',
          confirmationNumber: booking.confirmationNumber
        };
      }
    });

    res.json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue,
        dailyBookings,
        recentBookings: formattedRecentBookings
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
export const deleteAllBookings = async (req, res) => {
  try {
    await Booking.deleteMany({});
    
    res.json({
      success: true,
      message: 'All bookings have been deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

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
};

// Get All Bookings with Filters
export const getAllBookings = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { confirmationNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate && endDate) {
      query.dateTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .sort({ dateTime: -1 });

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
};