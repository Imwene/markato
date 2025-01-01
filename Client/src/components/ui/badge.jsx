// src/components/ui/badge.jsx
import React from "react";

const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";

  const variants = {
    default:
      "bg-primary-light/10 text-primary-dark dark:bg-orange-500/10 dark:text-orange-400",
    outline:
      "border border-border-DEFAULT bg-background-light dark:border-stone-700 dark:bg-stone-800 text-content-DEFAULT dark:text-white",
    success:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Badge };
