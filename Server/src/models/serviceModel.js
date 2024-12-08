import { Schema, model } from 'mongoose';

const serviceSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true
  },
  price: {
    type: String, // Using string to handle "25/35" format for sedan/SUV pricing
    required: [true, 'Price is required']
  },
  duration: {
    type: String,
    required: [true, 'Service duration is required']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: {
      values: ['EXPRESS', 'BASIC', 'PREMIUM', 'COMPLETE', 'ULTIMATE'],
      message: '{VALUE} is not a valid category'
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for upcoming bookings
serviceSchema.virtual('upcomingBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'service',
  match: { 
    dateTime: { $gte: new Date() },
    status: { $nin: ['CANCELLED', 'COMPLETED'] }
  }
});

const Service = model('Service', serviceSchema);
export default Service;