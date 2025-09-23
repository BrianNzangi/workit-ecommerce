/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',   // mobile (default)
        sm: '0rem',      // small screens
        md: '2rem',         // medium
        lg: '2rem',         // large
        xl: '2.5rem',       // extra large
        '2xl': '3rem',      // huge
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px", // your target
        "2xl": "1400px", // optional for larger displays
      },
    },
    extend: {
      colors: {
        primary: "#0046BE",
        secondary: "#1F2323",
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
