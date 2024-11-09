import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import Workflow from "./components/Workflow";
import Footer from "./components/Footer";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import BookingComponent from "./components/booking/BookingComponent";

const App = () => {
  return (
    <>
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
        {/* <Pricing /> */}
        {/* <Testimonials /> */}
        <Footer />
      </div>
    </>
  );
};

export default App;
