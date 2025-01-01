import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Phone, Mail } from 'lucide-react';

const BusinessMap = () => {
  const businessLocation = {
    lat: 37.80028,
    lng: -122.24903
  };

  const mapStyles = {
    height: '400px',
    width: '100%'
  };
  const defaultCenter = businessLocation;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const address = "1901 Park Blvd, Oakland, CA 94606"; // Combine address for Google Maps link
  const mapsLink = `https://www.google.com/maps/place/${encodeURIComponent(address)}`;
  return (
    <div id="find-us" className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-content-dark dark:text-white">
          Visit{" "}
          <span className="bg-gradient-to-r from-primary-light to-primary-DEFAULT dark:from-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
            Us
          </span>
        </h2>
        <p className="mt-2 text-content-light dark:text-stone-400">
          Find us at our convenient location
        </p>
      </div>

      <div className="rounded-lg shadow-lg overflow-hidden bg-white dark:bg-stone-800 border border-border-light dark:border-stone-700">
        <LoadScript googleMapsApiKey={googleMapsApiKey}>
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={15}
            center={defaultCenter}
          >
            <Marker position={businessLocation} />
          </GoogleMap>
        </LoadScript>
        
        <div className="p-6 bg-background-light dark:bg-stone-800">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-content-dark dark:text-white mb-2">
                Our Address
              </h3>
              <a 
                href={mapsLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-content-light dark:text-stone-400 hover:text-primary-DEFAULT dark:hover:text-orange-500 transition-colors"
              >
                {address} {/* Display the combined address */}
              </a>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-content-dark dark:text-white mb-2">
                Contact Us
              </h3>
              <div className="space-y-2">
                <p className="flex items-center text-content-light dark:text-stone-400">
                  <Phone className="w-4 h-4 mr-2 text-primary-light dark:text-orange-500" />
                  <a href="tel:+14158899108" className="hover:text-primary-light dark:hover:text-orange-500 transition-colors">
                    (415) 889-9108
                  </a>
                </p>
                <p className="flex items-center text-content-light dark:text-stone-400">
                  <Mail className="w-4 h-4 mr-2 text-primary-light dark:text-orange-500" />
                  <a href="mailto:markatoautodetail@gmail.com" className="hover:text-primary-light dark:hover:text-orange-500 transition-colors">
                    markatoautodetail@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-content-dark dark:text-white mb-2">
                Business Hours
              </h3>
              <p className="text-content-light dark:text-stone-400">
                Monday - Sunday: 9:00 AM - 5:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMap;