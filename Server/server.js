// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Streamlined booking schema
const bookingSchema = new mongoose.Schema({
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
}, { 
  timestamps: true 
});


const Booking = mongoose.model('Booking', bookingSchema);

app.post('/api/bookings', async (req, res) => {
  try {
    console.log('Received booking:', req.body);
    
     // Calculate total price
     const basePrice = parseFloat(req.body.servicePrice);
     const optionalServicesTotal = (req.body.optionalServices || [])
       .reduce((total, service) => total + parseFloat(service.price), 0);
     const totalPrice = basePrice + optionalServicesTotal;
 
     // Create booking object with optional services
     const bookingData = {
       ...req.body,
       totalPrice,
       // Ensure optional services is always an array
       optionalServices: req.body.optionalServices || []
     };
     
     const booking = new Booking(bookingData);
     const savedBooking = await booking.save();
    
    console.log('Saved booking:', savedBooking);

    res.status(201).json({
      success: true,
      data: savedBooking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude version key
      
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).select('-__v');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});