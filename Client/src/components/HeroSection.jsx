import React from "react";
import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";

const HeroSection = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Adjust for navbar height
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 lg:mt-20">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide">
        Welcome to
        <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
          {" "}
          Markato Auto Detailing
        </span>
      </h1>
      <p className="mt-10 text-lg text-center text-neutral-500 max-w-4xl">
        Your Car deserves nothing but the best car repair and services in town.
        Book a seemless car service experience with us.
      </p>
      <div className="flex justify-center my-10">
        <button
          onClick={() => scrollToSection("booking-section")}
          className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md hover:opacity-90 transition-opacity"
        >
          View Services
        </button>
        <button
          onClick={() => scrollToSection("workflow-section")}
          className="py-3 px-4 mx-3 rounded-md border hover:bg-neutral-800 transition-colors"
        >
          How we work
        </button>
      </div>

      <div className="w-full max-w-6xl px-4 mb-16">
        {" "}
        {/* Adjusted bottom margin */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 aspect-video">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg border border-orange-700 shadow-sm shadow-orange-400"
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
              className="w-full h-full object-cover rounded-lg border border-orange-700 shadow-sm shadow-orange-400"
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
