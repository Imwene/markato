// scripts/createAdminUser.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      //console.log("Admin user already exists");
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Markato19012025//!", salt);

    // Create new admin user
    const adminUser = new User({
      email: "Markatoautodetail@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();

    //console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
