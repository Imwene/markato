// src/models/storeConfigModel.js
import { Schema, model } from "mongoose";

const storeConfigSchema = new Schema(
  {
    storeName: {
      type: String,
      required: true,
      default: "Markato Auto Detailing",
    },
    address: {
      street: {
        type: String,
        required: true,
        default: "1901 Park Blvd",
      },
      city: {
        type: String,
        required: true,
        default: "Oakland",
      },
      state: {
        type: String,
        required: true,
        default: "CA",
      },
      zipCode: {
        type: String,
        required: true,
        default: "94606",
      },
      coordinates: {
        lat: {
          type: Number,
          required: true,
          default: 37.8044,
        },
        lng: {
          type: Number,
          required: true,
          default: -122.2712,
        },
      },
    },
    serviceRadius: {
      type: Number,
      required: true,
      default: 40, // miles
    },
    mobileServiceUpcharge: {
      type: Number,
      required: true,
      default: 50, // dollars
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active store config exists
storeConfigSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const StoreConfig = model("StoreConfig", storeConfigSchema);
export default StoreConfig;
