/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Light theme colors
        primary: {
          light: '#0cc0df',    // Bright blue
          DEFAULT: '#11a4a0',  // Teal
          dark: '#0e8c89',     // Darker teal for hover states
        },
        accent: {
          light: '#ffde59',    // Bright yellow
          DEFAULT: '#ffd11a',  // Slightly darker yellow
          dark: '#e6bc00',     // Darker yellow for hover states
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
        // Orange palette for dark mode
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      }
    },
  },
  plugins: [],
}