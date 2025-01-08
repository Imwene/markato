// src/components/Footer.jsx
import { resourcesLinks, platformLinks, communityLinks } from "../constants";

const Footer = () => {
  return (
    <footer className="mt-10 border-t py-8 border-border-light dark:border-stone-800 bg-background-DEFAULT dark:bg-stone-900">
      {/* <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <h3 className="text-md font-semibold mb-4 text-content-dark">Resources</h3>
          <ul className="space-y-2">
            {resourcesLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-content-light hover:text-primary-light transition-colors"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-md font-semibold mb-4 text-content-dark">Platform</h3>
          <ul className="space-y-2">
            {platformLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-content-light hover:text-primary-light transition-colors"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-md font-semibold mb-4 text-content-dark">Community</h3>
          <ul className="space-y-2">
            {communityLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-content-light hover:text-primary-light transition-colors"
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div> */}

      <div className="mt-10 pt-8 border-t border-border-light dark:border-stone-800">
        <p className="text-center text-content-light dark:text-stone-400 text-sm">
          © 2025 Markato Auto Detailing. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
