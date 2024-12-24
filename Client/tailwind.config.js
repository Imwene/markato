/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // New theme colors
        primary: {
          light: '#0cc0df',  // Bright blue
          DEFAULT: '#11a4a0', // Teal
          dark: '#0e8c89',   // Darker teal for hover states
        },
        accent: {
          light: '#ffde59',  // Bright yellow
          DEFAULT: '#ffd11a', // Slightly darker yellow
          dark: '#e6bc00',   // Darker yellow for hover states
        },
        background: {
          light: '#ffffff',    // Pure white
          DEFAULT: '#f8fafc',  // Very light gray-blue
          dark: '#f1f5f9',     // Light gray-blue for hover/active states
        },
        content: {
          light: '#64748b',    // Light text
          DEFAULT: '#334155',  // Default text
          dark: '#0f172a',     // Dark text/headings
        },
        border: {
          light: '#e2e8f0',    // Light borders
          DEFAULT: '#cbd5e1',  // Default borders
          dark: '#94a3b8',     // Dark borders
        },
        // Keep existing colors for backward compatibility
        "primary-color": "#f97316",
        "secondary-color": "#c2410c",
      }
    },
  },
  plugins: [],
}