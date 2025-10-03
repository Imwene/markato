// src/controllers/customerController.js
import Customer from '../models/customerModel.js';
import Booking from '../models/bookingModel.js';

// Get all customers with search and pagination
export const getAllCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'lastSeen', sortOrder = 'desc' } = req.query;
    
    let query = {};
    
    // Search by phone, name, or email
    if (search) {
      const normalizedSearch = normalizePhone(search);
      query.$or = [
        { phone: { $regex: normalizedSearch || search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const customers = await Customer.find(query)
      .populate('recentBookings', 'confirmationNumber dateTime serviceName totalPrice status')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Customer.countDocuments(query);
    
    res.json({
      success: true,
      data: customers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get customer by ID with full booking history
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findById(id)
      .populate({
        path: 'bookingIds',
        options: { sort: { createdAt: -1 } },
        select: 'confirmationNumber dateTime serviceName totalPrice status vehicleType makeModel optionalServices'
      });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to normalize phone numbers
const normalizePhone = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.substring(1);
  }
  return cleaned;
};

// Create or update customer
export const createOrUpdateCustomer = async (req, res) => {
  try {
    const { phone, name, email, preferences } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    const normalizedPhone = normalizePhone(phone);
    
    let customer = await Customer.findOne({ phone: normalizedPhone });
    
    if (customer) {
      // Update existing customer
      if (name) customer.name = name;
      if (email) customer.email = email;
      if (preferences) {
        customer.preferences = { ...customer.preferences, ...preferences };
      }
      customer.lastSeen = new Date();
    } else {
      // Create new customer
      customer = new Customer({
        phone: normalizedPhone,
        name,
        email,
        preferences
      });
    }
    
    await customer.save();
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Create/update customer error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Link booking to customer
export const linkBookingToCustomer = async (req, res) => {
  try {
    const { customerId, bookingId } = req.body;
    
    const customer = await Customer.findById(customerId);
    const booking = await Booking.findById(bookingId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Add booking to customer if not already linked
    if (!customer.bookingIds.includes(bookingId)) {
      customer.bookingIds.push(bookingId);
      await customer.updateStatistics();
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Link booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Auto-link existing bookings to customer by phone
export const autoLinkBookings = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    // Find bookings with matching phone number
    const bookings = await Booking.find({ 
      contact: customer.phone,
      _id: { $nin: customer.bookingIds }
    });
    
    // Add matching bookings to customer
    const newBookingIds = bookings.map(booking => booking._id);
    customer.bookingIds.push(...newBookingIds);
    
    await customer.updateStatistics();
    
    res.json({
      success: true,
      data: customer,
      linkedBookings: newBookingIds.length
    });
  } catch (error) {
    console.error('Auto-link bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Drop all customer records
export const dropAllCustomers = async (_req, res) => {
  try {
    console.log('Dropping all customer records...');
    
    // Get count before deletion
    const countBefore = await Customer.countDocuments();
    console.log(`Found ${countBefore} customer records to delete`);
    
    // Delete all customer documents
    const result = await Customer.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} customer records`);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} customer records`,
      data: {
        deletedCount: result.deletedCount,
        countBefore
      }
    });
  } catch (error) {
    console.error('Error dropping customer records:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Extract customers from bookings
export const extractCustomersFromBookings = async (_req, res) => {
  try {
    console.log('Starting customer extraction from bookings...');
    
    // Get bookings from the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    console.log(`Finding bookings since ${threeMonthsAgo.toISOString()}`);
    
    const recentBookings = await Booking.find({
      createdAt: { $gte: threeMonthsAgo }
    }).sort({ createdAt: -1 }).limit(1000); // Limit to prevent timeout
    
    console.log(`Found ${recentBookings.length} recent bookings`);
    
    let customersCreated = 0;
    let customersUpdated = 0;
    let bookingsLinked = 0;
    
    // Helper function to normalize phone numbers
    const normalizePhone = (phone) => {
      if (!phone) return null;
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return cleaned.substring(1);
      }
      return cleaned;
    };

    // Helper function to parse dateTime string to Date object
    const parseBookingDateTime = (dateTimeString) => {
      if (!dateTimeString) return null;
      try {
        // The dateTime is stored as a string like "Tue Oct 15, 2024, 2:30 PM"
        // We need to parse this into a Date object
        const date = new Date(dateTimeString.replace(/, (\d)/, ' $1'));
        return isNaN(date.getTime()) ? null : date;
      } catch (error) {
        console.warn('Failed to parse dateTime:', dateTimeString, error);
        return null;
      }
    };
    
    // Group bookings by phone number to identify unique customers
    const customersByPhone = new Map();
    
    for (const booking of recentBookings) {
      const phone = normalizePhone(booking.contact);
      if (!phone) {
        continue;
      }
      
      const appointmentDate = parseBookingDateTime(booking.dateTime);
      
      if (!customersByPhone.has(phone)) {
        customersByPhone.set(phone, {
          phone,
          name: booking.name?.trim() || '',
          email: booking.email?.trim() || '',
          bookings: [],
          totalSpent: 0,
          services: [],
          lastAppointmentDate: appointmentDate,
          firstAppointmentDate: appointmentDate
        });
      }
      
      const customer = customersByPhone.get(phone);
      customer.bookings.push(booking._id);
      customer.totalSpent += booking.totalPrice || 0;
      
      if (booking.serviceName && !customer.services.includes(booking.serviceName)) {
        customer.services.push(booking.serviceName);
      }
      
      // Update appointment date ranges
      if (appointmentDate) {
        if (!customer.lastAppointmentDate || appointmentDate > customer.lastAppointmentDate) {
          customer.lastAppointmentDate = appointmentDate;
        }
        if (!customer.firstAppointmentDate || appointmentDate < customer.firstAppointmentDate) {
          customer.firstAppointmentDate = appointmentDate;
        }
      }
    }
    
    console.log(`Identified ${customersByPhone.size} unique customers`);
    
    // Create or update customers
    for (const [phone, customerData] of customersByPhone) {
      try {
        // Check if customer already exists
        let customer = await Customer.findOne({ phone });
        
        const preferences = {
          defaultServices: customerData.services.slice(0, 3),
          notes: `Extracted from ${customerData.bookings.length} booking(s). ` +
                 `Preferred services: ${customerData.services.join(', ')}`
        };
        
        if (customer) {
          // Update existing customer
          if (!customer.name) customer.name = customerData.name;
          if (!customer.email) customer.email = customerData.email;
          customer.preferences = { ...customer.preferences, ...preferences };
          
          // Add new booking IDs
          const newBookingIds = customerData.bookings.filter(
            bookingId => !customer.bookingIds.includes(bookingId)
          );
          customer.bookingIds.push(...newBookingIds);
          
          // Update lastSeen to most recent appointment date if it's newer
          if (customerData.lastAppointmentDate && 
              (!customer.lastSeen || customerData.lastAppointmentDate > customer.lastSeen)) {
            customer.lastSeen = customerData.lastAppointmentDate;
          }
          
          await customer.updateStatistics();
          customersUpdated++;
        } else {
          // Create new customer
          customer = new Customer({
            phone: customerData.phone,
            name: customerData.name,
            email: customerData.email,
            preferences,
            bookingIds: customerData.bookings,
            statistics: {
              totalBookings: customerData.bookings.length,
              totalSpent: customerData.totalSpent,
              lastBookingDate: customerData.lastAppointmentDate || new Date(),
              averageBookingValue: customerData.totalSpent / customerData.bookings.length
            },
            lastSeen: customerData.lastAppointmentDate || new Date()
          });
          
          await customer.save();
          customersCreated++;
        }
        
        bookingsLinked += customerData.bookings.length;
        
      } catch (error) {
        console.error(`Error processing customer ${phone}:`, error);
      }
    }
    
    console.log('\n=== Extraction Summary ===');
    console.log(`Customers created: ${customersCreated}`);
    console.log(`Customers updated: ${customersUpdated}`);
    console.log(`Total bookings linked: ${bookingsLinked}`);
    
    const result = {
      customersCreated,
      customersUpdated,
      bookingsLinked,
      totalCustomers: customersCreated + customersUpdated
    };
    
    res.json({
      success: true,
      message: 'Customer extraction completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Customer extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get customer statistics
export const getCustomerStats = async (_req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ 
      'statistics.lastBookingDate': { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    });
    
    const topCustomers = await Customer.find()
      .sort({ 'statistics.totalBookings': -1 })
      .limit(10)
      .select('phone name statistics.totalBookings statistics.totalSpent');
    
    const totalRevenue = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$statistics.totalSpent' } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalCustomers,
        activeCustomers,
        totalRevenue: totalRevenue[0]?.total || 0,
        topCustomers
      }
    });
  } catch (error) {
    console.error('Customer stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};