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

📦 Project Root
├── 📂 Client (Frontend)
│   ├── 📂 src
│   │   ├── 📂 components
│   │   │   ├── 📂 ui
│   │   │   │   ├── 📄 tooltip.jsx
│   │   │   │   ├── 📄 badge.jsx
│   │   │   │   ├── 📄 input.jsx
│   │   │   │   └── 📄 table.jsx
│   │   │   ├── 📂 admin
│   │   │   │   ├── 📂 bookings
│   │   │   │   │   ├── 📄 BookingManager.jsx
│   │   │   │   │   └── 📄 StatusHistory.jsx
│   │   │   │   ├── 📂 layout
│   │   │   │   │   └── 📄 AdminLayout.jsx
│   │   │   │   ├── 📂 services
│   │   │   │   │   ├── 📄 ServiceManager.jsx
│   │   │   │   │   └── 📄 ServiceFormModal.jsx
│   │   │   │   └── 📂 dashboard
│   │   │   │       └── 📄 Dashboard.jsx
│   │   │   └── 📂 booking
│   │   │       ├── 📄 Confirmation.jsx
│   │   │       ├── 📄 BookingForm.jsx
│   │   │       ├── 📄 ServiceList.jsx
│   │   │       ├── 📄 BookingComponent.jsx
│   │   │       ├── 📄 VehicleTypeSelector.jsx
│   │   │       ├── 📄 OptionalServices.jsx
│   │   │       └── 📄 OptionToggle.jsx
│   │   ├── 📄 Workflow.jsx
│   │   ├── 📄 HeroSection.jsx
│   │   ├── 📄 FeatureSection.jsx
│   │   ├── 📄 Navbar.jsx
│   │   ├── 📄 Footer.jsx
│   │   ├── 📂 routes
│   │   │   └── 📄 admin.jsx
│   │   ├── 📂 context
│   │   │   ├── 📄 ServicesContext.jsx
│   │   │   └── 📄 AuthContext.jsx
│   │   ├── 📂 hooks
│   │   │   ├── 📄 useBookingState.js
│   │   │   └── 📄 useServices.js
│   │   ├── 📂 utils
│   │   │   └── 📄 index.js
│   │   ├── 📂 constants
│   │   │   └── 📄 index.jsx
│   │   ├── 📄 App.jsx
│   │   ├── 📄 main.jsx
│   │   └── 📄 index.css
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   └── 📄 index.html
│
├── 📂 Server (Backend)
│   ├── 📂 src
│   │   ├── 📂 controllers
│   │   │   ├── 📄 bookingController.js
│   │   │   ├── 📄 serviceController.js
│   │   │   └── 📄 adminController.js
│   │   ├── 📂 models
│   │   │   ├── 📄 bookingModel.js
│   │   │   ├── 📄 serviceModel.js
│   │   │   └── 📄 index.js
│   │   ├── 📂 routes
│   │   │   ├── 📄 bookingRoutes.js
│   │   │   ├── 📄 serviceRoutes.js
│   │   │   └── 📄 index.js
│   │   ├── 📂 middlewares
│   │   │   ├── 📄 cors.js
│   │   │   ├── 📄 errorHandler.js
│   │   │   └── 📄 validator.js
│   │   ├── 📂 config
│   │   │   ├── 📄 database.js
│   │   │   └── 📄 environment.js
│   │   └── 📂 scripts
│   │       └── 📄 seedServices.js
│   ├── 📄 server.js
│   ├── 📄 package.json
│   └── 📄 package-lock.json

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
