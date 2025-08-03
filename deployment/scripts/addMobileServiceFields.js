// Server/scripts/addMobileServiceFields.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "../src/models/bookingModel.js";
import StoreConfig from "../src/models/storeConfigModel.js";

dotenv.config();

const migrateMobileServiceFields = async () => {
  try {
    console.log("Starting mobile service migration...");

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Step 1: Update all existing bookings with default mobile service fields
    const existingBookingsUpdate = await Booking.updateMany(
      {
        $or: [
          { serviceType: { $exists: false } },
          { depositRequired: { $exists: false } },
          { depositAmount: { $exists: false } },
          { distanceFromStore: { $exists: false } },
        ],
      },
      {
        $set: {
          serviceType: "drive-in",
          depositRequired: false,
          depositAmount: 0,
          distanceFromStore: 0,
        },
      }
    );

    console.log(
      `Updated ${existingBookingsUpdate.modifiedCount} existing bookings with mobile service fields`
    );

    // Step 2: Create default store configuration if it doesn't exist
    const existingStoreConfig = await StoreConfig.findOne({ isActive: true });

    if (!existingStoreConfig) {
      const defaultStoreConfig = new StoreConfig({
        storeName: "Markato Auto Detailing",
        address: {
          street: "1901 Park Blvd",
          city: "Oakland",
          state: "CA",
          zipCode: "94606",
          coordinates: {
            lat: 37.8044,
            lng: -122.2712,
          },
        },
        serviceRadius: 40,
        mobileServiceUpcharge: 50,
        isActive: true,
      });

      await defaultStoreConfig.save();
      console.log("Created default store configuration");
    } else {
      console.log("Store configuration already exists");
    }

    // Step 3: Verify migration
    const totalBookings = await Booking.countDocuments();
    const migratedBookings = await Booking.countDocuments({
      serviceType: { $exists: true },
      depositRequired: { $exists: true },
      depositAmount: { $exists: true },
      distanceFromStore: { $exists: true },
    });

    console.log("\nMigration Summary:");
    console.log(`- Total bookings: ${totalBookings}`);
    console.log(`- Migrated bookings: ${migratedBookings}`);
    console.log(
      `- Migration coverage: ${(
        (migratedBookings / totalBookings) *
        100
      ).toFixed(1)}%`
    );

    if (migratedBookings === totalBookings) {
      console.log("✅ Migration completed successfully!");
    } else {
      console.log("⚠️ Some bookings may not have been migrated properly");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateMobileServiceFields();
}

export default migrateMobileServiceFields;
