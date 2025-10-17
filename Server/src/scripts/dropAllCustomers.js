// src/scripts/dropAllCustomers.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from '../models/customerModel.js';

// Load environment variables
dotenv.config();

const dropAllCustomers = async () => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to database...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/markato');
      console.log('Database connected');
    }

    console.log('Dropping all customer records...');
    
    // Get count before deletion
    const countBefore = await Customer.countDocuments();
    console.log(`Found ${countBefore} customer records to delete`);
    
    // Delete all customer documents
    const result = await Customer.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} customer records`);
    
    // Verify deletion
    const countAfter = await Customer.countDocuments();
    console.log(`Remaining customer records: ${countAfter}`);
    
    return result.deletedCount;
    
  } catch (error) {
    console.error('Error dropping customer records:', error);
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
  dropAllCustomers()
    .then((deletedCount) => {
      console.log(`Script completed successfully. Deleted ${deletedCount} records.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default dropAllCustomers;