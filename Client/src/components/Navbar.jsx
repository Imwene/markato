import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import markatoLogo from "../assets/png_markato.png";
import { navItems } from "../constants";

// In Navbar.jsx

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on the cancellation page
  const isCancellationPage = location.pathname.includes('/cancel-booking');

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace("#", ""));
    if (element) {
      const yOffset = -72;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setMobileDrawerOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 py-3 bg-background-light/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-border-light dark:border-stone-800 shadow-sm">
      <div className="container px-4 mx-auto relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/"
              className="flex items-center"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img 
                className="h-10 sm:h-14 w-auto object-contain
                         dark:[filter:brightness(0)_invert(1)_brightness(100%)_contrast(100%)]
                         transition-[filter] duration-300"
                src={markatoLogo} 
                alt="Markato Auto Detail" 
              />
            </Link>
          </div>

          {/* Only show menu items and hamburger if not on cancellation page */}
          {!isCancellationPage && (
            <>
              <ul className="hidden lg:flex space-x-8 text-sm">
                {navItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.href}
                      onClick={() => scrollToSection(item.href)}
                      className="text-content-DEFAULT hover:text-red-600
                        dark:text-stone-400 dark:hover:text-red-500
                        transition-colors cursor-pointer"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="lg:hidden p-1.5 text-content-DEFAULT dark:text-stone-400
                  hover:bg-background-dark dark:hover:bg-stone-800
                  rounded-md transition-colors"
                aria-label={mobileDrawerOpen ? "Close menu" : "Open menu"}
              >
                {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>

        {/* Mobile menu drawer */}
        {!isCancellationPage && mobileDrawerOpen && (
          <div className="absolute inset-x-0 top-full bg-background-light dark:bg-stone-900 border-b border-border-light dark:border-stone-800 shadow-lg lg:hidden animate-in slide-in-from-top duration-200">
            <ul className="py-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="block px-4 py-2 text-content-DEFAULT dark:text-stone-400
                      hover:bg-background-dark dark:hover:bg-stone-800
                      hover:text-red-600 dark:hover:text-red-500
                      transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;