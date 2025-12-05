// scripts/migrate-service-mobile-availability.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "../src/models/serviceModel.js";

dotenv.config();

async function migrateServiceMobileAvailability() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Starting migration: Setting isMobileAvailable for existing services...");

    // Update Basic and Complete services to isMobileAvailable: false
    const basicCompleteResult = await Service.updateMany(
      {
        name: { $regex: /^(BASIC|COMPLETE)$/i }
      },
      {
        $set: { isMobileAvailable: false }
      }
    );

    console.log(`Updated ${basicCompleteResult.modifiedCount} Basic/Complete service(s) to isMobileAvailable: false`);

    // Update all other services to isMobileAvailable: true (if not already set)
    // This ensures any existing services without the field get the default value
    const otherServicesResult = await Service.updateMany(
      {
        name: { $not: { $regex: /^(BASIC|COMPLETE)$/i } },
        $or: [
          { isMobileAvailable: { $exists: false } },
          { isMobileAvailable: null }
        ]
      },
      {
        $set: { isMobileAvailable: true }
      }
    );

    console.log(`Updated ${otherServicesResult.modifiedCount} other service(s) to isMobileAvailable: true`);

    // Verify the migration
    const basicCount = await Service.countDocuments({ name: { $regex: /^BASIC$/i }, isMobileAvailable: false });
    const completeCount = await Service.countDocuments({ name: { $regex: /^COMPLETE$/i }, isMobileAvailable: false });
    const mobileAvailableCount = await Service.countDocuments({ isMobileAvailable: true });

    console.log("\nMigration verification:");
    console.log(`- Basic services with isMobileAvailable=false: ${basicCount}`);
    console.log(`- Complete services with isMobileAvailable=false: ${completeCount}`);
    console.log(`- Services with isMobileAvailable=true: ${mobileAvailableCount}`);

    console.log("\nMigration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

migrateServiceMobileAvailability();

