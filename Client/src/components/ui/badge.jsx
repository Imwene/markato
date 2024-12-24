// src/components/ui/badge.jsx
import React from 'react';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  
  const variants = {
    default: 'bg-primary-light/10 text-primary-dark',
    outline: 'border border-border-DEFAULT bg-background-light text-content-DEFAULT',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
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