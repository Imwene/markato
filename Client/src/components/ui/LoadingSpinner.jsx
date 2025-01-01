// src/components/ui/LoadingSpinner.jsx
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2 
                  border-primary-light dark:border-orange-500"
      ></div>
      <span className="ml-2 text-content-light dark:text-stone-400">
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;
