import { features } from "../constants";

const FeatureSection = () => {
  return (
    <div
      id="why-choose-us"
      className="relative mt-10 border-b border-border-light dark:border-stone-800"
    >
      <div className="text-center">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-6 lg:mt-10 tracking-wide font-bold text-content-dark dark:text-white">
          Why Choose{" "}
          <span className="bg-gradient-to-r from-primary-light to-primary-DEFAULT dark:from-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
            Us
          </span>
        </h2>
      </div>

      <div className="flex flex-wrap mt-6 lg:mt-10">
        {features.map((feature, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3">
            <div className="flex group p-6 hover:bg-background-dark dark:hover:bg-stone-800/50 rounded-lg transition-colors">
              <div
                className="flex mx-6 h-10 w-10 p-2 
                bg-primary-light/10 text-primary-DEFAULT 
                dark:bg-orange-500/10 dark:text-orange-500
                justify-center items-center rounded-full
                group-hover:bg-primary-light dark:group-hover:bg-orange-500 
                group-hover:text-white
                transition-colors"
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="mt-1 mb-4 text-xl font-semibold text-content-dark dark:text-white">
                  {feature.text}
                </h3>
                <p className="text-md p-2 mb-4 text-content-light dark:text-stone-400">
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
