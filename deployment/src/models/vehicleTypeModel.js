import { Schema, model } from 'mongoose';

const vehicleTypeSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const VehicleType = model('VehicleType', vehicleTypeSchema);