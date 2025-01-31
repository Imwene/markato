// src/utils/performanceComponents.jsx
import React from "react";

export const ErrorFallback = () => (
  <div className="text-red-500 p-4">Error loading component</div>
);

export const LoadingFallback = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
  </div>
);

// HOC for performance monitoring
export const withPerformanceTracking = (WrappedComponent) => {
  const PerformanceWrapper = (props) => {
    React.useEffect(() => {
      const startTime = performance.now();
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        //console.log(`Component render time:`, duration);
      };
    }, []);

    return <WrappedComponent {...props} />;
  };

  PerformanceWrapper.displayName = `WithPerformance(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;
  return PerformanceWrapper;
};
