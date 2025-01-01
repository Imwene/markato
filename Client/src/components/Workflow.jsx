import { CheckCircle2 } from "lucide-react";
import codeImg from "../assets/code.jpg";
import { checklistItems } from "../constants";

const Workflow = () => {
  return (
    <div id="how-it-works">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mb-16 tracking-wide font-bold text-content-dark dark:text-white">
        How we{" "}
        <span className="bg-gradient-to-r from-primary-light to-primary-DEFAULT dark:from-orange-500 dark:to-orange-600 bg-clip-text text-transparent">
          Work.
        </span>
      </h2>

      <div className="flex flex-wrap justify-center gap-10 lg:gap-20">
        <div className="p-2 w-full lg:w-1/2">
          <img
            src={codeImg}
            alt="Coding"
            className="rounded-lg w-full h-auto object-cover shadow-lg 
                      border border-border-light dark:border-stone-700"
          />
        </div>

        <div className="w-full lg:w-5/12">
          <div className="space-y-10">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-start gap-6 group">
                <div className="flex-shrink-0">
                  <div className="text-primary-DEFAULT dark:text-orange-500 
                                bg-primary-light/10 dark:bg-orange-500/10 
                                h-10 w-10 flex items-center justify-center rounded-full
                                group-hover:bg-primary-light dark:group-hover:bg-orange-500 
                                group-hover:text-white
                                transition-colors duration-200">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h5 className="text-xl font-medium mb-2 text-content-dark dark:text-white">
                    {item.title}
                  </h5>
                  <p className="text-content-light dark:text-stone-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workflow;