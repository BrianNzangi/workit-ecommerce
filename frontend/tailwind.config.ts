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
          900: "#cc0000",
          800: "#d5372b",
          700: "#dd5445",
          600: "#e46c5c",
          500: "#ea8273",
          400: "#f0988a",
          300: "#f5ada1",
          200: "#f9c1b8",
          100: "#fcd6d0",
          50: "#feeae7",
        },
        secondary: {
          900: "#060709",
          800: "#181a1c",
          700: "#2d2e31",
          600: "#444547",
          500: "#5c5d5f",
          400: "#757677",
          300: "#8f8f91",
          200: "#aaaaab",
          100: "#c5c6c6",
          50: "#e2e2e2",
        },
        accent: {
          900: "#1C9737",
          800: "#E8EAED",
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
