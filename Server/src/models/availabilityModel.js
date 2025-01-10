import { Schema, model } from 'mongoose';

const availabilitySchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedTimeSlots: [{
    type: String
  }],
  maxBookingsPerSlot: {
    type: Number,
    default: 2
  },
  reason: {
    type: String
  },
  // For recurring blocks (e.g., lunch breaks)
  isRecurring: {
    type: Boolean,
    default: false
  },
  // If recurring, which days of week (0-6, 0 is Sunday)
  recurringDays: [{
    type: Number
  }],
}, { timestamps: true });

export const Availability = model('Availability', availabilitySchema);