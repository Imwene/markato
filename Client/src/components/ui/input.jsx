// src/components/ui/input.jsx
import React from "react";

const Input = React.forwardRef(
  ({ className = "", type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md 
      border border-border-DEFAULT dark:border-stone-700
  bg-background-light dark:bg-stone-800
  px-3 py-2 text-sm text-content-DEFAULT dark:text-white
  file:border-0 file:bg-transparent file:text-sm file:font-medium
  placeholder:text-content-light dark:placeholder:text-stone-500
  focus-visible:outline-none focus-visible:ring-2 
  focus-visible:ring-primary-light dark:focus-visible:ring-orange-500 
  focus-visible:ring-offset-2
  disabled:cursor-not-allowed disabled:opacity-50
  hover:border-border-dark dark:hover:border-stone-600
      ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
