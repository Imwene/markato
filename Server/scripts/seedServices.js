// scripts/seedServices.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../src/models/serviceModel.js';

dotenv.config();

const services = [
  {
    name: "BASIC",
    features: [
      "Foam Pressure hand wash",
      "Rinse & Dry",
      "Window & Side mirror cleaned",
      "Wheel Cleaning & tire shine",
      "Interior wipe down",
      "Trunk Cleaning"
    ],
    vehiclePricing: {
      'sedan': 40,
      'mini-suv': 50,
      'suv': 60,
      'van/truck': 80
    },
    duration: 45,
    sortOrder: 1
  },
  {
    name: "COMPLETE",
    features: [
     "Foam Pressure hand wash",
     "Rinse & Dry",
     "Window & Side mirror cleaned",
     "Wheel Cleaning & tire shine",
     "Complete interior wipe down, including all plastics & leather",
     "Trunk Cleaning",
     "Light Stain Removal",
     "Rubber mat wash",
     "Leather conditioning leather"
    ],
    vehiclePricing: {
        'sedan': 80,
        'mini-suv': 100,
        'suv': 120,
        'van/truck': 160
    },
    duration: 60,
    sortOrder: 1
  },
  {
    name: "ULTIMATE",
    features: [
      "ALL IN COMPLETE",
      "WAX"
    ],
    vehiclePricing: {
        'sedan': 130,
        'mini-suv': 150,
        'suv': 170,
        'van/truck': 210
    },
    duration: 100,
    sortOrder: 1
  },
  {
    name: "DEEP CLEAN",
    features: [
        "ALL IN COMPLETE",
        "SHAMPOO"
    ],
    vehiclePricing: {
        'sedan': 300,
        'mini-suv': 350,
        'suv': 400,
        'van/truck': 400
    },
    duration: 200,
    sortOrder: 1
  },
  {
    name: "POLISH",
    features: [
        "ALL IN COMPLETE",
        "POLISH"
    ],
    vehiclePricing: {
        'sedan': 350,
        'mini-suv': 400,
        'suv': 450,
        'van/truck': 450
    },
    duration: 250,
    sortOrder: 1
  },
];

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing services
    await Service.deleteMany({});
    
    // Insert new services
    await Service.insertMany(services);
    
    console.log('Services seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
}

seedServices();