import { Schema, model } from "mongoose";

const businessSettingsSchema = new Schema(
  {
    // Day of week the business is unavailable/closed (0 = Sunday ... 6 = Saturday)
    unavailableDay: {
      type: Number,
      min: 0,
      max: 6,
      default: null,
    },
  },
  { timestamps: true }
);

export const BusinessSettings = model(
  "BusinessSettings",
  businessSettingsSchema
);
