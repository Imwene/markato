// src/scripts/extractCustomersFromBookings.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from '../models/customerModel.js';
import Booking from '../models/bookingModel.js';

// Load environment variables
dotenv.config();

const extractCustomersFromBookings = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to database...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/markato');
      console.log('Database connected');
    }

    console.log('Starting customer extraction from bookings...');
    
    // Get bookings from the last 30 days (reduced for performance)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`Finding bookings since ${thirtyDaysAgo.toISOString()}`);

    const recentBookings = await Booking.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${recentBookings.length} recent bookings`);
    
    let customersCreated = 0;
    let customersUpdated = 0;
    let bookingsLinked = 0;
    
    // Group bookings by phone number to identify unique customers
    const customersByPhone = new Map();
    
    // Helper function to normalize phone numbers
    const normalizePhone = (phone) => {
      if (!phone) return null;
      // Remove all non-digit characters
      const cleaned = phone.replace(/\D/g, '');
      // Handle US phone numbers (10 or 11 digits)
      if (cleaned.length === 10) {
        return cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return cleaned.substring(1); // Remove leading '1'
      }
      return cleaned; // Return as-is for international numbers
    };

    for (const booking of recentBookings) {
      const phone = normalizePhone(booking.contact);
      if (!phone) {
        console.log('Skipping booking without valid phone number:', booking._id);
        continue;
      }
      
      if (!customersByPhone.has(phone)) {
        customersByPhone.set(phone, {
          phone,
          name: booking.name?.trim() || '',
          email: booking.email?.trim() || '',
          bookings: [],
          totalSpent: 0,
          vehicleTypes: new Set(),
          services: new Set(),
          firstBookingDate: booking.createdAt,
          lastBookingDate: booking.createdAt
        });
      }
      
      const customer = customersByPhone.get(phone);
      customer.bookings.push(booking._id);
      customer.totalSpent += booking.totalPrice || 0;
      
      if (booking.vehicleType) {
        customer.vehicleTypes.add(booking.vehicleType);
      }
      
      if (booking.serviceName) {
        customer.services.add(booking.serviceName);
      }
      
      // Update booking date range
      if (booking.createdAt < customer.firstBookingDate) {
        customer.firstBookingDate = booking.createdAt;
      }
      if (booking.createdAt > customer.lastBookingDate) {
        customer.lastBookingDate = booking.createdAt;
      }
    }
    
    console.log(`Identified ${customersByPhone.size} unique customers`);
    
    // Create or update customers
    for (const [phone, customerData] of customersByPhone) {
      try {
        // Check if customer already exists
        let customer = await Customer.findOne({ phone });
        
        const preferences = {
          defaultVehicleType: customerData.vehicleTypes.size === 1 ? 
            Array.from(customerData.vehicleTypes)[0] : '',
          defaultServices: Array.from(customerData.services).slice(0, 3), // Top 3 services
          notes: `Extracted from ${customerData.bookings.length} booking(s). ` +
                 `Preferred services: ${Array.from(customerData.services).join(', ')}`
        };
        
        if (customer) {
          // Update existing customer
          customer.name = customer.name || customerData.name;
          customer.email = customer.email || customerData.email;
          customer.preferences = { ...customer.preferences, ...preferences };
          
          // Add new booking IDs
          const newBookingIds = customerData.bookings.filter(
            bookingId => !customer.bookingIds.includes(bookingId)
          );
          customer.bookingIds.push(...newBookingIds);
          
          await customer.updateStatistics();
          customersUpdated++;
          console.log(`Updated existing customer: ${phone}`);
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
              lastBookingDate: customerData.lastBookingDate,
              averageBookingValue: customerData.totalSpent / customerData.bookings.length
            },
            lastSeen: customerData.lastBookingDate
          });
          
          await customer.save();
          customersCreated++;
          console.log(`Created new customer: ${phone} (${customerData.name})`);
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
    console.log('Extraction completed successfully!');
    
    return {
      customersCreated,
      customersUpdated,
      bookingsLinked,
      totalCustomers: customersCreated + customersUpdated
    };
    
  } catch (error) {
    console.error('Error during customer extraction:', error);
    throw error;
  } finally {
    // Close database connection if we opened it
    if (process.argv[1] === __filename) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
};

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  extractCustomersFromBookings()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default extractCustomersFromBookings;