import React from "react";
import { motion } from "framer-motion";

const CommunicationTerms = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      {/* Add checkmark circle */}
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-content-dark dark:text-white text-center">
        Communication Terms & Acknowledgment
      </h1>


      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Communication Consent</h2>
          <p>
          By making a booking with Markato Auto Detail through markatodetailing.com, 
          you acknowledge and agree that Markato LLC (S Corporation) may contact you via:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Email communications</li>
            <li>Text messages (SMS)</li>
            <li>Phone calls</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Types of Communications
          </h2>
          <p>These communications may include:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Booking confirmations and updates</li>
            <li>Appointment reminders</li>
            <li>Service status updates</li>
            <li>Follow-up communications about your service</li>
            <li>Important updates about your appointment</li>
            <li>Requests for feedback about our service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You can opt-out of promotional communications at any time</li>
            <li>
              Essential service-related communications may still be sent to
              ensure proper service delivery
            </li>
            <li>
              You can update your communication preferences by contacting us
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Legal Compliance</h2>
          <p>This acknowledgment is in compliance with:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Telephone Consumer Protection Act (TCPA)</li>
            <li>CAN-SPAM Act</li>
            <li>California Consumer Privacy Act (CCPA)</li>
          </ul>
        </section>

        <section className="mt-12 text-sm text-content-light dark:text-stone-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>Markato LLC (S Corporation), operating as Markato Auto Detail</p>
          <p>1900 Park Blvd, Oakland, CA 94606</p>
        </section>
      </div>
    </motion.div>
  );
};

export default CommunicationTerms;
