import { Schema, model } from 'mongoose';

// Keep existing timestamps and strict schema settings
const bookingSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  makeModel: {
    type: String,
    required: true
  },
  dateTime: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  serviceId: {
    type: Number,
    required: true
  },
  selectedScent: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  servicePrice: {
    type: Number,
    required: true
  },
  serviceDescription: {
    type: String,
    required: true
  },
  optionalServices: [{
    serviceId: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
    default: function() {
      const basePrice = this.servicePrice || 0;
      const optionalTotal = (this.optionalServices || []).reduce((sum, service) => 
        sum + (service.price || 0), 0);
      return basePrice + optionalTotal;
    }
  },
  confirmationNumber: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

const Booking = model('Booking', bookingSchema);
export default Booking;