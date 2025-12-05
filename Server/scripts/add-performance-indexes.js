import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const addPerformanceIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Adding performance indexes...');

    // Get database instance
    const db = mongoose.connection.db;

    // Critical indexes for customer extraction queries
    console.log('Creating booking indexes...');
    await db.collection("bookings").createIndex(
      { contact: 1, createdAt: -1 },
      { name: "contact_createdAt" }
    );

    await db.collection("bookings").createIndex(
      { createdAt: -1, status: 1 },
      { name: "createdAt_status" }
    );

    console.log('Creating customer indexes...');
    await db.collection("customers").createIndex(
      { phone: 1, "statistics.lastBookingDate": -1 },
      { name: "phone_lastBookingDate" }
    );

    await db.collection("customers").createIndex(
      { "statistics.totalBookings": -1, "statistics.totalSpent": -1 },
      { name: "totalBookings_totalSpent" }
    );

    console.log('✅ Performance indexes added successfully!');

    // List all indexes to verify
    console.log('\nVerifying indexes...');
    const bookingIndexes = await db.collection("bookings").indexes();
    console.log('Booking indexes:', bookingIndexes.map(idx => idx.name));

    const customerIndexes = await db.collection("customers").indexes();
    console.log('Customer indexes:', customerIndexes.map(idx => idx.name));

  } catch (error) {
    console.error('❌ Error adding indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

addPerformanceIndexes();