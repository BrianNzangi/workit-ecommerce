import type { Config } from 'tailwindcss';

import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
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
        primary: {
          900: "#ff5023",
          800: "#ff6742",
          700: "#ff7b5a",
          600: "#ff8d70",
          500: "#ff9f85",
          400: "#ffaf99",
          300: "#ffc0ae",
          200: "#ffd0c2",
          100: "#ffe0d6",
        },
        secondary: {
          900: "#1F2323",
          800: "#323535",
          700: "#454949",
          600: "#5a5d5d",
          500: "#707272",
          400: "#868888",
          300: "#9d9f9f",
          200: "#b5b6b6",
          100: "#cdcece",
        },
        accent: {
          900: "#1C9737",
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
