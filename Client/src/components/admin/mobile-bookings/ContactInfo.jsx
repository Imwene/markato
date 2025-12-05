import { Phone, Mail } from "lucide-react";
import PropTypes from "prop-types";

const ContactInfo = ({ contact, email }) => {
  if (!contact && !email) return null;

  return (
    <div className="space-y-2">
      {contact && (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <a 
            href={`tel:${contact}`}
            className="text-sm text-gray-900 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {contact}
          </a>
        </div>
      )}
      
      {email && (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <a 
            href={`mailto:${email}`}
            className="text-sm text-gray-900 dark:text-stone-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
            title={email}
          >
            {email}
          </a>
        </div>
      )}
    </div>
  );
};

ContactInfo.propTypes = {
  contact: PropTypes.string,
  email: PropTypes.string
};

export default ContactInfo;