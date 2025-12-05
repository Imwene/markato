import { Schema, model } from "mongoose";

// Default business hours - can be adjusted seasonally via admin panel
const DEFAULT_BUSINESS_HOURS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

const businessSettingsSchema = new Schema(
  {
    // Day of week the business is unavailable/closed (0 = Sunday ... 6 = Saturday)
    unavailableDay: {
      type: Number,
      min: 0,
      max: 6,
      default: null,
    },
    // Controls whether mobile detailing service is available for customers
    // When false, customers can only book drive-in services
    mobileDetailingEnabled: {
      type: Boolean,
      default: false, // Disabled by default for launch preparation
    },
    // Configurable business hours for booking time slots
    // Array of time strings in "H:MM AM/PM" format
    // Can be adjusted seasonally (e.g., shorter hours in winter, longer in summer)
    businessHours: {
      type: [String],
      default: DEFAULT_BUSINESS_HOURS,
      validate: {
        validator: function (hours) {
          // Validate each time string format
          const timeRegex = /^(1[0-2]|[1-9]):([0-5][0-9])\s?(AM|PM)$/i;
          return hours.every((time) => timeRegex.test(time));
        },
        message: "Invalid time format. Use format like '9:00 AM' or '12:30 PM'",
      },
    },
  },
  { timestamps: true }
);

export { DEFAULT_BUSINESS_HOURS };

export const BusinessSettings = model(
  "BusinessSettings",
  businessSettingsSchema
);
