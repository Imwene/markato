import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';


const BusinessMap = () => {
  // Replace these coordinates with your actual business location
  const businessLocation = {
    lat: 37.80028, // Your business latitude
    lng: -122.24903  // Your business longitude
  };

  const mapStyles = {
    height: '400px',
    width: '100%'
  };
  const defaultCenter = businessLocation;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  return (

    <div id= "find-us" className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-content-dark">Visit Us</h2>
        <p className="mt-2 text-content-light">Find us at our convenient location</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <LoadScript googleMapsApiKey={googleMapsApiKey}>
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={15}
            center={defaultCenter}
          >
            <Marker position={businessLocation} />
          </GoogleMap>
        </LoadScript>
        
        <div className="p-6 bg-background-light">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-content-dark mb-2">Our Address</h3>
              <p className="text-content-light">1901 Park Blvd</p>
              <p className="text-content-light">Oakland, CA 94606</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-content-dark mb-2">Business Hours</h3>
              <p className="text-content-light">Monday - Sunday: 9:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default BusinessMap;