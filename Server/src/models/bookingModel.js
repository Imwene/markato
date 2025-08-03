// src/models/bookingModel.js
import { Schema, model } from "mongoose";

const statusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: "",
  },
});

const bookingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    makeModel: {
      type: String,
      required: true,
    },
    dateTime: {
      type: String,
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    selectedScent: String,
    servicePrice: {
      type: Number,
      required: true,
    },
    optionalServices: [
      {
        serviceId: Number,
        name: String,
        price: Number,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    statusHistory: [statusHistorySchema],
    confirmationNumber: {
      type: String,
      required: true,
    },

    // NEW MOBILE SERVICE FIELDS
    serviceType: {
      type: String,
      enum: ["drive-in", "mobile"],
      default: "drive-in",
    },
    customerAddress: {
      street: {
        type: String,
        required: function () {
          return this.serviceType === "mobile";
        },
      },
      city: {
        type: String,
        required: function () {
          return this.serviceType === "mobile";
        },
      },
      state: {
        type: String,
        required: function () {
          return this.serviceType === "mobile";
        },
      },
      zipCode: {
        type: String,
        required: function () {
          return this.serviceType === "mobile";
        },
      },
      coordinates: {
        lat: {
          type: Number,
          required: function () {
            return this.serviceType === "mobile";
          },
        },
        lng: {
          type: Number,
          required: function () {
            return this.serviceType === "mobile";
          },
        },
      },
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
    depositRequired: {
      type: Boolean,
      default: false,
    },
    distanceFromStore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: false, // Allow additional fields for backward compatibility
  }
);

const Booking = model("Booking", bookingSchema);
export default Booking;
