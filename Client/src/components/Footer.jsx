// src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="mt-10 border-t py-8 border-border-light dark:border-stone-800 bg-background-DEFAULT dark:bg-stone-900">
      <div className="mt-10 pt-8 border-t border-border-light dark:border-stone-800">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-content-light dark:text-stone-400 text-sm">
            © 2025 Markato Auto Detailing. All rights reserved.
          </p>
          <a
            href="/communication-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-DEFAULT dark:text-orange-500 hover:underline"
          >
            Communication Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
