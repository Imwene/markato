// src/components/HeroSection.jsx
import React from "react";
import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";

const HeroSection = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 lg:mt-20">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide font-bold text-content-dark">
        Welcome to
        <span className="bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
          {" "}
          Markato Auto Detailing
        </span>
      </h1>
      
      <p className="mt-10 text-lg text-center text-content-light max-w-4xl">
        Your car deserves nothing but the best detailing services in town.
        Book a seamless car service experience with us.
      </p>
      
      <div className="flex justify-center my-10 gap-4">
        <button
          onClick={() => scrollToSection("booking-section")}
          className="bg-gradient-to-r from-primary-light to-primary-DEFAULT 
                   text-white py-3 px-6 rounded-md hover:opacity-90 transition-opacity
                   shadow-lg shadow-primary-light/20"
        >
          View Services
        </button>
        
        <button
          onClick={() => scrollToSection("workflow-section")}
          className="py-3 px-6 rounded-md border border-border-DEFAULT
                   text-content-DEFAULT hover:bg-background-dark 
                   hover:border-border-dark transition-colors"
        >
          How we work
        </button>
      </div>

      <div className="w-full max-w-6xl px-4 mb-16">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 aspect-video">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg 
                       border border-primary-light/20 
                       shadow-lg shadow-primary-light/10"
            >
              <source src={video1} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="w-full md:w-1/2 aspect-video">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg 
                       border border-primary-light/20 
                       shadow-lg shadow-primary-light/10"
            >
              <source src={video2} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;