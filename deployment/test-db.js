import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './src/models/customerModel.js';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    const count = await Customer.countDocuments();
    console.log(`Total customers in database: ${count}`);

    // Check specific customer identifiers
    const testIds = ['68ef533367321ae885117557', '68ef533367321ae88511755e'];
    for (const testId of testIds) {
      const specificCustomer = await Customer.findById(testId);
      if (specificCustomer) {
        console.log(`Customer ${testId} exists:`, {
          id: specificCustomer._id,
          phone: specificCustomer.phone,
          name: specificCustomer.name
        });
      } else {
        console.log(`Customer ${testId} NOT found in database`);
      }
    }

    if (count > 0) {
      const customers = await Customer.find().select('_id phone name').limit(3);
      console.log('Sample customers:');
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ID: ${customer._id}, Phone: ${customer.phone}, Name: ${customer.name || 'N/A'}`);
      });
    } else {
      console.log('No customers found in database');
    }

    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Database check failed:', error.message);
  }
}

checkDatabase();