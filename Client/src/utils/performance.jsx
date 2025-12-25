// src/utils/performance.js
import React from "react";
// Image optimization utility
export const optimizeImage = async (file, options = {}) => {
  const { maxWidth = 1200, quality = 0.8, format = "webp" } = options;

  if (!file) return null;

  try {
    const imageData = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Calculate new dimensions
    let width = imageData.width;
    let height = imageData.height;

    if (width > maxWidth) {
      height = Math.floor((height * maxWidth) / width);
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw and compress image
    ctx.drawImage(imageData, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), `image/${format}`, quality);
    });
  } catch (error) {
    console.error("Image optimization failed:", error);
    return file;
  }
};

// Cache management
export const cacheManager = {
  // Set cache with expiry
  set: (key, value, expiryInMinutes = 60) => {
    const item = {
      value,
      expiry: new Date().getTime() + expiryInMinutes * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  // Get cache if not expired
  get: (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (new Date().getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  },

  // Clear expired items
  clearExpired: () => {
    Object.keys(localStorage).forEach((key) => {
      cacheManager.get(key);
    });
  },
};

// Performance monitoring
const METRICS_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes max age for metrics
const METRICS_CLEANUP_INTERVAL_MS = 60 * 1000; // Cleanup every minute

export const performanceMonitor = {
  metrics: {},

  // Start timing
  startTiming: (label) => {
    performanceMonitor.metrics[label] = {
      startTime: performance.now(),
      timestamp: Date.now(),
    };
  },

  // End timing and get duration
  endTiming: (label) => {
    const metric = performanceMonitor.metrics[label];
    if (!metric) return 0;

    const duration = performance.now() - metric.startTime;
    delete performanceMonitor.metrics[label];
    return duration;
  },

  // Log performance data
  logPerformance: (metric) => {
    if (import.meta.env.PROD) {
      // Send to analytics service
      //console.log('Performance metric:', metric);
    }
  },

  // Clear stale metrics (older than METRICS_MAX_AGE_MS)
  clearStaleMetrics: () => {
    const now = Date.now();
    Object.keys(performanceMonitor.metrics).forEach((key) => {
      const metric = performanceMonitor.metrics[key];
      if (metric && metric.timestamp && now - metric.timestamp > METRICS_MAX_AGE_MS) {
        delete performanceMonitor.metrics[key];
      }
    });
  },

  // Clear all metrics
  clearAllMetrics: () => {
    performanceMonitor.metrics = {};
  },
};

// Auto-cleanup stale metrics periodically (browser-only)
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.clearStaleMetrics();
  }, METRICS_CLEANUP_INTERVAL_MS);
}

// Service Worker Registration
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      //console.log('ServiceWorker registration successful');
      return registration;
    } catch (error) {
      console.error("ServiceWorker registration failed:", error);
      return null;
    }
  }
  return null;
};

// Create a separate file for React components
// src/utils/performanceComponents.jsx
export const createErrorComponent = () => {
  const ErrorComponent = () => (
    <div className="text-red-500 p-4">Error loading component</div>
  );
  return { default: ErrorComponent };
};

// Lazy loading utility for components
export const lazyLoadComponent = (importFunc) => {
  return React.lazy(() => {
    return importFunc().catch((error) => {
      console.error("Error loading component:", error);
      // Return the component directly, not the object
      return createErrorComponent().default;
    });
  });
};

// Bundle analyzer for development
export const analyzeBundleSize = () => {
  if (!import.meta.env.PROD) {
    // Only available in development
    //console.log('Bundle size analysis available in dev mode');
  }
};
