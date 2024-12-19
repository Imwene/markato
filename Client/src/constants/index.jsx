import { BotMessageSquare } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Fingerprint } from "lucide-react";
import { ShieldHalf } from "lucide-react";
import { PlugZap } from "lucide-react";
import { GlobeLock } from "lucide-react";

import user1 from "../assets/profile-pictures/user1.jpg";
import user2 from "../assets/profile-pictures/user2.jpg";
import user3 from "../assets/profile-pictures/user3.jpg";
import user4 from "../assets/profile-pictures/user4.jpg";
import user5 from "../assets/profile-pictures/user5.jpg";
import user6 from "../assets/profile-pictures/user6.jpg";

export const navItems = [
  { label: "Why Choose Us", href: "#" },
  { label: "How it works", href: "#" },
  // { label: "Pricing", href: "#" },
  // { label: "Testimonials", href: "#" },
];

export const testimonials = [
  {
    user: "John Doe",
    company: "Stellar Solutions",
    image: user1,
    text: "I am extremely satisfied with the services provided. The team was responsive, professional, and delivered results beyond my expectations.",
  },
  {
    user: "Jane Smith",
    company: "Blue Horizon Technologies",
    image: user2,
    text: "I couldn't be happier with the outcome of our project. The team's creativity and problem-solving skills were instrumental in bringing our vision to life",
  },
  {
    user: "David Johnson",
    company: "Quantum Innovations",
    image: user3,
    text: "Working with this company was a pleasure. Their attention to detail and commitment to excellence are commendable. I would highly recommend them to anyone looking for top-notch service.",
  },
  {
    user: "Ronee Brown",
    company: "Fusion Dynamics",
    image: user4,
    text: "Working with the team at XYZ Company was a game-changer for our project. Their attention to detail and innovative solutions helped us achieve our goals faster than we thought possible. We are grateful for their expertise and professionalism!",
  },
  {
    user: "Michael Wilson",
    company: "Visionary Creations",
    image: user5,
    text: "I am amazed by the level of professionalism and dedication shown by the team. They were able to exceed our expectations and deliver outstanding results.",
  },
  {
    user: "Emily Davis",
    company: "Synergy Systems",
    image: user6,
    text: "The team went above and beyond to ensure our project was a success. Their expertise and dedication are unmatched. I look forward to working with them again in the future.",
  },
];

export const features = [
  {
    icon: <BotMessageSquare />,
    text: "Convenience",
    description: "Hastle free, fast services and easy payments.",
  },
  {
    icon: <Fingerprint />,
    text: "Transparency",
    description:
      "We fix even your trust in car service and repair because we have build our business on trust.",
  },
  {
    icon: <ShieldHalf />,
    text: "Quality",
    description:
      "We are committed to quality and take car care seriously. Top-notch service is our main auto motive.",
  },
  {
    icon: <BatteryCharging />,
    text: "Skilled technicians",
    description: "Benefit from expert knowledge and precision workmanship.",
  },
  {
    icon: <PlugZap />,
    text: "Genuine spares",
    description:
      "Ensure optimal performance and longevity with authentic replacement parts.",
  },
  {
    icon: <GlobeLock />,
    text: "Real-time updates",
    description:
      "Stay informed about your vehicle's service progress with timely notifications.",
  },
];

export const checklistItems = [
  {
    title: "Select Your Car",
    description: "We Service most makes and models",
  },
  {
    title: "Select The Perfect Car Service",
    description: "From our broad portfolio of Services",
  },
  {
    title: "Get a quote",
    description: "Get a fair and reasonable quote from our website",
  },
  {
    title: "Book An Appointment",
    description: "Book an appointment at a time of your convenience.",
  },
];

export const pricingOptions = [
  {
    title: "Free",
    price: "$0",
    features: [
      "Private board sharing",
      "5 Gb Storage",
      "Web Analytics",
      "Private Mode",
    ],
  },
  {
    title: "Pro",
    price: "$10",
    features: [
      "Private board sharing",
      "10 Gb Storage",
      "Web Analytics (Advance)",
      "Private Mode",
    ],
  },
  {
    title: "Enterprise",
    price: "$200",
    features: [
      "Private board sharing",
      "Unlimited Storage",
      "High Performance Network",
      "Private Mode",
    ],
  },
];

export const resourcesLinks = [
  { href: "#", text: "Getting Started" },
  { href: "#", text: "Documentation" },
  // { href: "#", text: "Tutorials" },
  // { href: "#", text: "API Reference" },
  // { href: "#", text: "Community Forums" },
];

export const platformLinks = [
  { href: "#", text: "Features" },
  // { href: "#", text: "Supported Devices" },
  // { href: "#", text: "System Requirements" },
  // { href: "#", text: "Downloads" },
  { href: "#", text: "Release Notes" },
];

export const communityLinks = [
  { href: "#", text: "Events" },
  // { href: "#", text: "Meetups" },
  // { href: "#", text: "Conferences" },
  // { href: "#", text: "Hackathons" },
  { href: "#", text: "Jobs" },
];

// Vehicle options as described by client
export const vehicleTypes = [
  { id: 'sedan', label: 'Sedan'},
  { id: 'mini-suv', label: 'Mini SUV'},
  { id: 'suv', label: 'SUV' },
  { id: 'van/truck', label: 'Van/Truck'}
];

export const services = {
  "drive-in": [
    {
      id: 1,
      name: "BASIC",
      basePrice: 40,
      description:
        "Foamy bath, Bug off, Pressure blast, Tire scrub, Spot-free rinse & Towel dry",
    },
    {
      id: 2,
      name: "COMPLETE",
      basePrice: 80,
      description:
        "Foamy bath, Bug off, Pressure blast, Tire scrub, Spot-free rinse, Towel dry, Wheel cleaner, Tire dressing & Inside vacuum",
    },
    {
      id: 3,
      name: "ULTIMATE",
      basePrice: 130,
      description:
        "Foamy bath, Bug off, Pressure blast, Tire scrub, Spot-free rinse, Towel dry, Wheel cleaner, Tire shine, Paint protection, Vacuum & Interior clean",
    },
    {
      id: 4,
      name: "DEEP CLEAN",
      basePrice: 300,
      description:
        "Foamy bath, Bug off, Pressure blast, Tire scrub, Spot-free rinse, Towel dry, Wheel cleaner & shine, Tire dressing and shine, Paint protection & extra shine, Deep Vacuum, Adhesive removal & Leather conditioning",
    },
    {
      id: 5,
      name: "POLISH",
      basePrice: 350,
      description: "Complete Service + Wax",
    },
  ],
  appointment: [
    {
      id: 6,
      name: "DEEP CLEAN",
      price: "200/250",
      description: "Ultimate Service + Shampoo",
    },
    {
      id: 7,
      name: "POLISH",
      price: "300/400",
      description: "Ultimate Service + Polish",
    },
  ],
};

export const scents = [
  { id: 1, name: "Eucalyptus Mint Tea" },
  { id: 2, name: "Strawberry Lemon" },
  { id: 3, name: "Lemon Concentrate" },
  { id: 4, name: "None" },
];

export const optionalServicesData = [
  {
    id: 1,
    name: "Interior Sanitization",
    description: "Deep clean and sanitize all interior surfaces",
    price: "20"
  },
  {
    id: 2,
    name: "Pet hair removal",
    description: "Thorough removal of pet hair from all surfaces",
    price: "40"
  },
  {
    id: 3,
    name: "Headlight Restoration",
    description: "Restore clarity to foggy or yellowed headlights",
    price: "45"
  },
  {
    id: 4,
    name: "Seat Cloth Shampoo",
    description: "Clean specific seat with extra attention",
    price: "50"
  },
  {
    id: 5,
    name: "Paint Protection",
    description: "Give restored look to your paintjob",
    price: "50"
  }
];
