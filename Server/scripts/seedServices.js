// scripts/seedServices.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../src/models/serviceModel.js';

dotenv.config();

const services = [
  {
    name: "BASIC",
    features: [
        "Foam pressure hand wash",
        "Rinse & Dry",
        "Wheel cleaning & tire shine",
        "Interior vacuum",
        "Interior wipe down",
        "Trunk vacuum & cleaning",
        "Window & Side mirror cleaned",
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
        "Foam pressure hand wash",
        "Rinse & Dry",
        "Wheel cleaning & tire shine",
        "Interior vacuum",
        "Complete interior wipe down, including all plastics & leather",
        "Trunk vacuum & cleaning",
        "Light stain Removal",
        "Rubber mat wash",
        "Leather conditioning lotion",
        "Window & Side mirror cleaned",
    ],
    vehiclePricing: {
        'sedan': 75,
        'mini-suv': 90,
        'suv': 100,
        'van/truck': 140
    },
    duration: 60,
    sortOrder: 2
  },
  {
    name: "ULTIMATE",
    features: [
      "ALL IN COMPLETE + WAX",
    ],
    vehiclePricing: {
        'sedan': 125,
        'mini-suv': 140,
        'suv': 160,
        'van/truck': 190
    },
    duration: 100,
    sortOrder: 3
  },
  {
    name: "DEEP CLEAN",
    features: [
        "ALL IN COMPLETE + SHAMPOO",
    ],
    vehiclePricing: {
        'sedan': 300,
        'mini-suv': 350,
        'suv': 400,
        'van/truck': 400
    },
    duration: 200,
    sortOrder: 4
  },
  {
    name: "POLISH",
    features: [
        "ALL IN COMPLETE + POLISH",
    ],
    vehiclePricing: {
        'sedan': 350,
        'mini-suv': 400,
        'suv': 450,
        'van/truck': 450
    },
    duration: 250,
    sortOrder: 5
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