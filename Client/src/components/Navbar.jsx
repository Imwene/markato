// src/components/Navbar.jsx
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.png";
import { navItems } from "../constants";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <nav className="sticky top-0 z-50 py-3 bg-background-light/80 backdrop-blur-lg border-b border-border-light shadow-sm">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
            <span className="text-xl tracking-tight font-semibold text-content-dark">
              Markato
            </span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex ml-14 space-x-12">
            {navItems.map((item, index) => (
              <li key={index}>
                <a 
                  href={item.href} 
                  className="text-content-DEFAULT hover:text-primary-light transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex justify-center space-x-6 items-center">
            <a 
              href="#" 
              className="py-2 px-4 text-content-DEFAULT border border-border-DEFAULT rounded-md 
                       hover:bg-background-dark hover:border-border-dark transition-colors"
            >
              Sign In
            </a>
            <a
              href="#"
              className="py-2 px-4 bg-gradient-to-r from-primary-light to-primary-DEFAULT 
                       text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Create an account
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden md:flex flex-col justify-end">
            <button 
              onClick={toggleNavbar}
              className="p-2 text-content-DEFAULT hover:bg-background-dark rounded-md transition-colors"
            >
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileDrawerOpen && (
          <div className="fixed inset-x-0 top-[73px] z-20 bg-background-light border-b border-border-light 
                        p-6 flex flex-col items-center lg:hidden animate-in fade-in slide-in-from-top">
            <ul className="w-full space-y-4 mb-6">
              {navItems.map((item, index) => (
                <li key={index} className="text-center">
                  <a 
                    href={item.href}
                    className="block py-2 text-content-DEFAULT hover:text-primary-light transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col w-full space-y-4">
              <a 
                href="#" 
                className="w-full py-2 px-4 text-center text-content-DEFAULT border border-border-DEFAULT 
                         rounded-md hover:bg-background-dark transition-colors"
              >
                Sign In
              </a>
              <a
                href="#"
                className="w-full py-2 px-4 text-center bg-gradient-to-r from-primary-light to-primary-DEFAULT 
                         text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Create an account
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;