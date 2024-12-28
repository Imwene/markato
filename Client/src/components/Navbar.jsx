import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import markatoLogo from "../assets/markato-logo.svg";
import { navItems } from "../constants";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace("#", ""));
    if (element) {
      const yOffset = -80; // Adjust this value based on your navbar height
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setMobileDrawerOpen(false); // Close the mobile menu after clicking
    }
  };

  return (
    <nav className="sticky top-0 z-50 py-3 bg-background-light/80 backdrop-blur-lg border-b border-border-light shadow-sm">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/"
              className="flex items-center"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img className="logo" src={markatoLogo} alt="Markato" />
              {/* <span className="text-xl tracking-tight font-semibold text-content-dark">
                Markato
              </span> */}
            </Link>
          </div>

          <ul className="hidden lg:flex ml-14 space-x-12">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href} // Use Link component for internal links
                  onClick={() => scrollToSection(item.href)} // Scroll to section on click
                  className="text-content-DEFAULT hover:text-primary-light transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="lg:hidden md:flex flex-col justify-end">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 text-content-DEFAULT hover:bg-background-dark rounded-md transition-colors"
              aria-label={mobileDrawerOpen ? "Close menu" : "Open menu"}
            >
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileDrawerOpen && (
          <div
            className="fixed inset-x-0 top-[73px] z-20 bg-background-light border-b border-border-light 
                        p-6 flex flex-col items-center lg:hidden animate-in fade-in slide-in-from-top"
          >
            <ul className="w-full space-y-4">
              {navItems.map((item, index) => (
                <li key={index} className="text-center">
                  <Link
                    to={item.href}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full py-2 text-content-DEFAULT hover:text-primary-light transition-colors"
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
