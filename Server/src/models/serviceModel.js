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
      required: true
    },
    'mini-suv': {
      type: Number,
      required: true
    },
    'suv': {
      type: Number,
      required: true
    },
    'van/truck': {
      type: Number,
      required: true
    }
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
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
  timestamps: true
});

const Service = model('Service', serviceSchema);
export default Service;