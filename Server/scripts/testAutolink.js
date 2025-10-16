import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { autoLinkBookings } from '../src/controllers/customerController.js';

dotenv.config();

const runTest = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const testIdentifiers = [
    '68ef533367321ae88511755e', // ObjectId string
    '5105938174' // Phone number
  ];

  for (const identifier of testIdentifiers) {
    console.log(`\nTesting autolink with identifier: ${identifier}`);

    const req = {
      params: { id: identifier }
    };

    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        console.log('Response status:', this.statusCode);
        console.log('Response payload:', payload);
      }
    };

    await autoLinkBookings(req, res);
  }

  await mongoose.disconnect();
};

runTest().catch((err) => {
  console.error('Autolink test failed:', err);
  mongoose.disconnect();
});