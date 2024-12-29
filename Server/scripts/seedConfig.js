// scripts/seedConfig.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { VehicleType } from "../src/models/vehicleTypeModel.js";
import { Scent } from "../src/models/scentModel.js";
import { OptionalService } from "../src/models/optionalServiceModel.js";

dotenv.config();

const vehicleTypes = [
  { id: "sedan", label: "Sedan", sortOrder: 1 },
  { id: "mini-suv", label: "Mini SUV", sortOrder: 2 },
  { id: "suv", label: "SUV", sortOrder: 3 },
  { id: "van/truck", label: "Van/Truck", sortOrder: 4 },
];

const scents = [
  { id: 1, name: "Eucalyptus", sortOrder: 1 },
  { id: 2, name: "Strawberry Lemon", sortOrder: 2 },
  { id: 3, name: "Lemon Concentrate", sortOrder: 3 },
  { id: 4, name: "None", sortOrder: 4 },
];

const optionalServices = [
  {
    id: 1,
    name: "Interior Sanitization",
    description: "Deep clean and sanitize all interior surfaces",
    price: 20,
    sortOrder: 1,
  },
  {
    id: 2,
    name: "Pet hair removal",
    description: "Thorough removal of pet hair from all surfaces",
    price: 40,
    sortOrder: 2,
  },
  {
    id: 3,
    name: "Headlight Restoration",
    description: "Restore clarity to foggy or yellowed headlights",
    price: 45,
    sortOrder: 3,
  },
  {
    id: 4,
    name: "Seat Cloth Shampoo",
    description: "Clean specific seat with extra attention",
    price: 50,
    sortOrder: 4,
  },
  {
    id: 5,
    name: "Paint Protection",
    description: "Give restored look to your paintjob",
    price: 50,
    sortOrder: 5,
  },
];

async function seedConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await VehicleType.deleteMany({});
    await Scent.deleteMany({});
    await OptionalService.deleteMany({});

    // Insert new data
    await VehicleType.insertMany(vehicleTypes);
    await Scent.insertMany(scents);
    await OptionalService.insertMany(optionalServices);

    //console.log('Configuration data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error("Error seeding configuration data:", error);
    process.exit(1);
  }
}

seedConfig();
