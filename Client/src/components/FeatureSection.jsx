// src/components/FeatureSection.jsx
import { features } from "../constants";

const FeatureSection = () => {
  return (
    <div id="why-choose-us" className="relative mt-20 border-b border-border-light min-h-[800px]">
      <div className="text-center">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking-wide font-bold text-content-dark">
          Why Choose{" "}
          <span className="bg-gradient-to-r from-primary-light to-primary-DEFAULT bg-clip-text text-transparent">
            Us{" "}
          </span>
        </h2>
      </div>
      
      <div className="flex flex-wrap mt-10 lg:mt-20">
        {features.map((feature, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3">
            <div className="flex group p-6 hover:bg-background-dark rounded-lg transition-colors">
              <div className="flex mx-6 h-10 w-10 p-2 bg-primary-light/10 text-primary-DEFAULT 
                           justify-center items-center rounded-full
                           group-hover:bg-primary-light group-hover:text-white
                           transition-colors">
                {feature.icon}
              </div>
              <div>
                <h5 className="mt-1 mb-4 text-xl font-semibold text-content-dark">
                  {feature.text}
                </h5>
                <p className="text-md p-2 mb-20 text-content-light">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;