// src/components/ui/LoadingSpinner.jsx
const LoadingSpinner = () => {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
        <span className="ml-2 text-content-light">Loading...</span>
      </div>
    );
  };
  
  export default LoadingSpinner;