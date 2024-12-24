// src/models/serviceModel.js
import { Schema, model } from 'mongoose';

const serviceSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  vehiclePricing: {
    'sedan': {
      type: Number,
      required: true,
      min: 0
    },
    'mini-suv': {
      type: Number,
      required: true,
      min: 0
    },
    'suv': {
      type: Number,
      required: true,
      min: 0
    },
    'van/truck': {
      type: Number,
      required: true,
      min: 0
    }
  },
  category: {
    type: String,
    enum: ['DRIVE-IN', 'APPOINTMENT'],
    default: 'DRIVE-IN'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  strict: false  // Allow additional fields for backward compatibility
});

const Service = model('Service', serviceSchema);
export default Service;