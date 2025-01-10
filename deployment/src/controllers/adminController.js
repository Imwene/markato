// src/controllers/adminController.js
import Booking from '../models/bookingModel.js';

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get today's date and last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last7Days = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

    // Get today's bookings
    const todayBookings = await Booking.find({
      dateTime: {
        $gte: today,
        $lt: tomorrow
      }
    }).select('name serviceName totalPrice status dateTime');

    // Get today's revenue
    const todayRevenue = todayBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Get weekly revenue (last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyBookings = await Booking.find({
      dateTime: {
        $gte: weekAgo,
        $lt: tomorrow
      }
    });

    const weeklyRevenue = weeklyBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Get monthly revenue (current month)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyBookings = await Booking.find({
      dateTime: {
        $gte: monthStart,
        $lte: monthEnd
      }
    });

    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Get popular services
    const popularServices = await Booking.aggregate([
      {
        $group: {
          _id: '$serviceName',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          bookings: 1,
          revenue: { $round: ['$revenue', 2] }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Get average booking value
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Get completion rate
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    // Get popular optional services
    const popularOptionalServices = await Booking.aggregate([
      { $unwind: '$optionalServices' },
      {
        $group: {
          _id: '$optionalServices.name',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          popularity: '$count'
        }
      },
      { $sort: { popularity: -1 } },
      { $limit: 7 }
    ]);

    // Get popular scents
    const popularScents = await Booking.aggregate([
      {
        $group: {
          _id: '$selectedScent',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'scents',
          localField: '_id',
          foreignField: 'name',
          as: 'scent'
        }
      },
      { $unwind: '$scent' },
      {
        $project: {
          _id: 0,
          name: '$_id',
          popularity: '$count'
        }
      },
      { $sort: { popularity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue,
        dailyBookings,
        recentBookings: formattedRecentBookings,
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        popularServices,
        averageBookingValue,
        completionRate,
        todayBookings,
        popularOptionalServices,
        popularScents
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

// Get Weekly Bookings
export const getWeeklyBookings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse dates from strings to Date objects
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Build date strings for each day in the range
    const dates = [];
    const currentDate = new Date(parsedStartDate);
    while (currentDate <= parsedEndDate) {
      dates.push(
        currentDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Create query using $or to match any of the dates
    const bookings = await Booking.find({
      dateTime: {
        $regex: new RegExp(dates.map(date => `^${date}`).join('|'))
      }
    }).sort({ dateTime: 1 });

    console.log('Date patterns:', dates);
    console.log('Found bookings:', bookings.length);
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Weekly bookings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
