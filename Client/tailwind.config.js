/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-color": "#f97316", // orange-500 to match existing theme
        "secondary-color": "#c2410c", // orange-700 to match existing theme
      },
    },
  },
  plugins: [],
};
