// src/controllers/customerController.js
import mongoose from 'mongoose';
import Customer from '../models/customerModel.js';
import Booking from '../models/bookingModel.js';
import { parseAppointmentDateTime, getMostRecentAppointmentDateByStatus } from '../utils/dateTimeParser.js';

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
    const { customerId, id } = req.params;
    const rawId = customerId || id;
    console.log('Autolink requested with params:', req.params, 'Resolved ID:', rawId);

    if (!rawId) {
      return res.status(400).json({
        success: false,
        error: 'Customer identifier is required'
      });
    }

    let customer;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      customer = await Customer.findById(rawId);
    }

    if (!customer) {
      const normalizedPhone = normalizePhone(rawId);
      customer = await Customer.findOne({ phone: normalizedPhone || rawId });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    console.log('Autolink resolved customer:', {
      id: customer._id,
      phone: customer.phone,
      name: customer.name
    });

    // Find unlinked bookings with matching phone number (reverse lookup - much faster)
    const potentialBookings = await Booking.find({
      contact: customer.phone,
      customerId: { $exists: false }
    }).sort({ createdAt: -1 }).limit(500);

    if (potentialBookings.length === 0) {
      return res.json({
        success: true,
        data: customer,
        linkedBookings: 0,
        message: 'No unlinked bookings found for this customer'
      });
    }

    // Filter out any bookings that are already linked on the customer document
    const existingBookingIds = new Set(customer.bookingIds.map(id => id.toString()));
    const bookings = potentialBookings.filter(booking => !existingBookingIds.has(booking._id.toString()));

    if (bookings.length === 0) {
      return res.json({
        success: true,
        data: customer,
        linkedBookings: 0,
        message: 'All matching bookings are already linked to this customer'
      });
    }

    // Process bookings in batches to prevent timeouts
    const batchSize = 100;
    let totalLinked = 0;

    for (let i = 0; i < bookings.length; i += batchSize) {
      const batch = bookings.slice(i, i + batchSize);

      // Link this batch of bookings
      const batchIds = batch.map(booking => booking._id);
      customer.bookingIds.push(...batchIds);

      // Update bookings with customerId reference
      await Booking.updateMany(
        { _id: { $in: batchIds } },
        { $set: { customerId: customer._id } }
      );

      // Update statistics incrementally for this batch
      const batchTotalSpent = batch.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const batchBookingDates = batch.map(booking => parseAppointmentDateTime(booking.dateTime)).filter(date => date !== null);

      customer.statistics.totalBookings += batch.length;
      customer.statistics.totalSpent += batchTotalSpent;
      customer.statistics.averageBookingValue = customer.statistics.totalBookings > 0 ?
        customer.statistics.totalSpent / customer.statistics.totalBookings : 0;

      // Update last booking date if this batch has newer bookings
      if (batchBookingDates.length > 0) {
        const maxBatchDate = new Date(Math.max(...batchBookingDates.map(date => date.getTime())));
        if (!customer.statistics.lastBookingDate || maxBatchDate > customer.statistics.lastBookingDate) {
          customer.statistics.lastBookingDate = maxBatchDate;
        }
      }

      // Update last seen date for completed/cancelled bookings
      const lastSeenDate = getMostRecentAppointmentDateByStatus(batch, ['completed', 'cancelled']);
      if (lastSeenDate && (!customer.lastSeen || lastSeenDate > customer.lastSeen)) {
        customer.lastSeen = lastSeenDate;
      }

      totalLinked += batch.length;

      // Save progress every 100 bookings
      if (i + batchSize < bookings.length || i === 0) {
        await customer.save();
      }
    }
    
    // Final save
    await customer.save();

    res.json({
      success: true,
      data: customer,
      linkedBookings: totalLinked,
      message: totalLinked > 0
        ? `Successfully linked ${totalLinked} booking${totalLinked !== 1 ? 's' : ''} to customer`
        : 'All matching bookings are already linked to this customer'
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
export const extractCustomersFromBookings = async (req, res) => {
  try {
    console.log('Starting customer extraction from bookings...');
    
    // Get bookings from the last 30 days (reduced for performance)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBookings = await Booking.find({
      createdAt: { $gte: thirtyDaysAgo }
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

    // Use the centralized dateTime parser from utils
    const parseBookingDateTime = parseAppointmentDateTime;
    
    // Group bookings by phone number to identify unique customers
    const customersByPhone = new Map();
    
    console.log(`Processing ${recentBookings.length} bookings...`);
    
    // Progress tracking
    let processedCount = 0;
    const totalBookings = recentBookings.length;
    const progressInterval = Math.max(1, Math.floor(totalBookings / 20)); // Show progress every 5%
    
    for (const booking of recentBookings) {
      const phone = normalizePhone(booking.contact);
      if (!phone) {
        processedCount++;
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
      
      processedCount++;
      
      // Show progress
      if (processedCount % progressInterval === 0 || processedCount === totalBookings) {
        const percentage = Math.round((processedCount / totalBookings) * 100);
        const barLength = 20;
        const filledLength = Math.round((barLength * percentage) / 100);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        console.log(`[${bar}] ${percentage}% (${processedCount}/${totalBookings} bookings processed)`);
      }
    }
    
    console.log(`\nIdentified ${customersByPhone.size} unique customers`);
    console.log('Creating/updating customer records...');
    
    // Create or update customers with progress tracking
    let customerCount = 0;
    const totalCustomers = customersByPhone.size;
    const customerProgressInterval = Math.max(1, Math.floor(totalCustomers / 10)); // Show progress every 10%
    
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
          
          // Let updateStatistics handle the correct lastSeen calculation
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
            // Let updateStatistics calculate all statistics correctly
            statistics: {
              totalBookings: 0,
              totalSpent: 0,
              averageBookingValue: 0
            }
          });
          
          // Use updateStatistics to properly calculate dates
          await customer.updateStatistics();
          customersCreated++;
        }
        
        bookingsLinked += customerData.bookings.length;
        
        customerCount++;
        
        // Show customer processing progress
        if (customerCount % customerProgressInterval === 0 || customerCount === totalCustomers) {
          const percentage = Math.round((customerCount / totalCustomers) * 100);
          const barLength = 20;
          const filledLength = Math.round((barLength * percentage) / 100);
          const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
          console.log(`[${bar}] ${percentage}% (${customerCount}/${totalCustomers} customers processed)`);
        }
        
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