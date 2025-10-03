// src/models/customerModel.js
import { Schema, model } from 'mongoose';

const customerSchema = new Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    set: (val) => {
      // Normalize phone number before saving
      if (!val) return val;
      const cleaned = val.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return cleaned.substring(1);
      }
      return cleaned;
    }
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  preferences: {
    defaultVehicleType: String,
    defaultServices: [String],
    notes: String,
    vipStatus: {
      type: Boolean,
      default: false
    },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'sms'],
      default: 'phone'
    }
  },
  statistics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    lastBookingDate: Date,
    averageBookingValue: {
      type: Number,
      default: 0
    }
  },
  bookingIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ 'statistics.lastBookingDate': -1 });
customerSchema.index({ 'statistics.totalBookings': -1 });

// Virtual for recent bookings
customerSchema.virtual('recentBookings', {
  ref: 'Booking',
  localField: 'bookingIds',
  foreignField: '_id',
  options: { sort: { createdAt: -1 }, limit: 5 }
});

// Method to update statistics
customerSchema.methods.updateStatistics = async function() {
  const Booking = model('Booking');
  const bookings = await Booking.find({ _id: { $in: this.bookingIds } });
  
  this.statistics.totalBookings = bookings.length;
  this.statistics.totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  this.statistics.averageBookingValue = this.statistics.totalBookings > 0 ? 
    this.statistics.totalSpent / this.statistics.totalBookings : 0;
  
  if (bookings.length > 0) {
    this.statistics.lastBookingDate = Math.max(...bookings.map(b => new Date(b.createdAt)));
  }
  
  this.lastSeen = new Date();
  return this.save();
};

// Static method to find or create customer by phone
customerSchema.statics.findOrCreateByPhone = async function(phone, additionalData = {}) {
  let customer = await this.findOne({ phone });
  
  if (!customer) {
    customer = new this({
      phone,
      ...additionalData
    });
    await customer.save();
  }
  
  return customer;
};

const Customer = model('Customer', customerSchema);
export default Customer;