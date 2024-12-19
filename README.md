# Markato Auto Detailing - Full Stack Project Documentation

## Project Overview
This is a full-stack application for a car detailing service business with both client and server components. The client is built with React/Vite, and the server uses Node.js/Express with MongoDB.

## System Architecture

### Client-Side (React/Vite)
The frontend follows a component-based architecture with React and uses modern patterns like hooks and context for state management.

Key Technologies:
- React with Vite
- TailwindCSS for styling
- Framer Motion for animations
- Lucide React for icons
- React Router for navigation
- React Query for data fetching
- ShadCN UI components

### Server-Side (Node.js/Express)
The backend follows the MVC pattern and provides a RESTful API for the client application.

Key Technologies:
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin requests
- Express Validator for request validation

## Directory Structure

### Client Side (`/client`)
```
src/
├── assets/                 # Static assets (images, videos)
├── constants/             
│   └── index.jsx          # App-wide constants (services, pricing, etc.)
├── hooks/                 
│   ├── useBookingState.js # Booking state management
│   └── useServices.js     # Services data management
├── components/           
│   ├── booking/           # Booking flow components
│   │   ├── BookingComponent.jsx  # Main booking container
│   │   ├── BookingForm.jsx       # User details form
│   │   ├── Confirmation.jsx      # Booking confirmation
│   │   ├── OptionalServices.jsx  # Additional services
│   │   ├── ServiceList.jsx       # Available services
│   │   └── VehicleTypeSelector.jsx # Vehicle selection
│   ├── admin/             # Admin dashboard components
│   │   ├── layout/
│   │   ├── bookings/
│   │   ├── dashboard/
│   │   └── services/
│   └── common/            # Shared components (Navbar, Footer, etc.)
├── context/               # React Context providers
└── routes/               # Route configurations
```

### Server Side (`/server`)
```
src/
├── models/               # Database schemas
│   ├── bookingModel.js   # Booking data structure
│   └── serviceModel.js   # Service offerings structure
├── controllers/          # Business logic
│   ├── adminController.js
│   ├── bookingController.js
│   └── serviceController.js
├── routes/              # API endpoints
├── middlewares/         # Custom middleware
└── config/             # App configuration
```

## Key Features

### Public Features
1. **Service Booking System**
   - Vehicle type selection (Sedan, Mini SUV, SUV, Van/Truck)
   - Multiple service packages
   - Optional add-on services
   - Real-time pricing calculation
   - Booking confirmation with unique reference number

2. **Service Packages**
   - Basic
   - Complete
   - Ultimate
   - Deep Clean
   - Polish
   Each with different pricing based on vehicle type

3. **User Interface**
   - Responsive design
   - Animated transitions
   - Step-by-step booking process
   - Form validation

### Admin Features
1. **Dashboard**
   - Booking statistics
   - Daily booking charts
   - Recent bookings overview

2. **Booking Management**
   - View all bookings
   - Filter and search bookings
   - Update booking status
   - Booking details view

3. **Service Management**
   - Manage service packages
   - Update pricing
   - Enable/disable services

## Data Models

### Service Model
```javascript
{
  name: String,
  features: [String],
  vehiclePricing: {
    sedan: Number,
    'mini-suv': Number,
    suv: Number,
    'van/truck': Number
  },
  category: String,
  isActive: Boolean,
  sortOrder: Number
}
```

### Booking Model
```javascript
{
  name: String,
  contact: String,
  vehicleType: String,
  makeModel: String,
  dateTime: String,
  serviceId: String,
  serviceName: String,
  selectedScent: String,
  servicePrice: Number,
  optionalServices: [{
    serviceId: Number,
    name: String,
    price: Number
  }],
  totalPrice: Number,
  confirmationNumber: String
}
```

## State Management
- React Context for global state (Services, Auth)
- Custom hooks for complex state logic (useBookingState)
- MongoDB for persistent data storage

## API Endpoints

### Public API
- `GET /api/services` - Get all active services
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details

### Admin API
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings
- `PUT /api/admin/bookings/:id` - Update booking status
- `GET /api/admin/services` - Manage services

## Development Setup

### Client
```bash
cd client
npm install
npm run dev
```

### Server
```bash
cd server
npm install
npm run dev
```

## Environment Configuration
The application uses environment variables for configuration:
- Database connection string
- API endpoints
- CORS settings
- Authentication secrets

## Authentication
- Admin authentication using JWT
- Protected admin routes
- Session management

## Security Features
- CORS configuration
- Request validation
- Error handling middleware
- Secure booking reference generation

## Deployment Considerations
- Environment-specific configurations
- Database indexing
- API rate limiting
- Error logging and monitoring
