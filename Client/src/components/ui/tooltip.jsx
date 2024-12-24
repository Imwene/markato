// src/components/ui/tooltip.jsx
import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const updatePosition = () => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let newTop = triggerRect.bottom + 10;
      let newLeft = triggerRect.left;

      if (newLeft + tooltipRect.width > window.innerWidth) {
        newLeft = window.innerWidth - tooltipRect.width - 10;
      }

      if (newTop + tooltipRect.height > window.innerHeight) {
        newTop = triggerRect.top - tooltipRect.height - 10;
      }

      setPosition({
        top: newTop,
        left: Math.max(10, newLeft)
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          className="z-50 w-64 p-2 text-sm bg-background-light border border-border-DEFAULT rounded-lg shadow-lg text-content-DEFAULT"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export { Tooltip };