// import Navbar from "./components/Navbar";
// import HeroSection from "./components/HeroSection";
// import FeatureSection from "./components/FeatureSection";
// import Workflow from "./components/Workflow";
// import Footer from "./components/Footer";
// import Pricing from "./components/Pricing";
// import Testimonials from "./components/Testimonials";
// import BookingComponent from "./components/booking/BookingComponent";

// const App = () => {
//   return (
//     <div className="relative min-h-screen">
//       {/* Background Container */}
//       <div className="fixed inset-0 z-0">
//         <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90 mix-blend-overlay" />
//         <img
//           src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" // Replace with your actual image URL
//           alt=""
//           className="w-full h-full object-cover opacity-60"
//         />
//       </div>

//       {/* Content Container */}
//       <div className="relative z-10">
//         <Navbar />
//         <div className="max-w-7xl mx-auto pt-20 px-6">
//           <HeroSection />
//           <div className="mb-20" id="booking-section">
//             <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mb-10 tracking-wide">
//               Book Your Service
//             </h2>
//             <BookingComponent />
//           </div>
//           <div id="workflow-section" className="mb-20">
//             <Workflow />
//           </div>
//           <FeatureSection />
//           {/* <Pricing /> */}
//           {/* <Testimonials /> */}
//           <Footer />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import Workflow from "./components/Workflow";
import Footer from "./components/Footer";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import BookingComponent from "./components/booking/BookingComponent";
import { BrowserRouter as Router } from "react-router-dom";
import { ServicesProvider } from './context/ServicesContext';

const App = () => {
  // return (
  //   <>
  //     <Navbar />
  //     <div className="max-w-7xl mx-auto pt-20 px-6">
  //       <HeroSection />
  //       <div className="mb-20" id="booking-section">
  //         <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mb-10 tracking-wide">
  //           Book Your Service
  //         </h2>
  //         <BookingComponent />
  //       </div>
  //       <div id="workflow-section" className="mb-20">
  //         <Workflow />
  //       </div>
  //       <FeatureSection />
  //       {/* <Pricing /> */}
  //       {/* <Testimonials /> */}
  //       <Footer />
  //     </div>
  //   </>
  // );
  return (
    <ServicesProvider>
      <Navbar />
      <div className="max-w-7xl mx-auto pt-20 px-6">
        <HeroSection />
        <div className="mb-20" id="booking-section">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mb-10 tracking-wide">
            Book Your Service
          </h2>
          <BookingComponent />
        </div>
        <div id="workflow-section" className="mb-20">
          <Workflow />
        </div>
        <FeatureSection />
        <Footer />
      </div>
    </ServicesProvider>
  );

};

export default App;
