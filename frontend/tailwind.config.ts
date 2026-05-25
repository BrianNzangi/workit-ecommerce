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
          900: "#e71333",
          800: "#ed4049",
          700: "#f35c5d",
          600: "#f77471",
          500: "#fb8985",
          400: "#fe9e99",
          300: "#ffb2ad",
          200: "#ffc5c1",
          100: "#ffd9d6",
          50: "#ffecea",
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
          900: "#00755f",
          800: "#30826e",
          700: "#4b907d",
          600: "#629d8c",
          500: "#79ab9c",
          400: "#8fb9ac",
          300: "#a6c6bc",
          200: "#bcd4cc",
          100: "#d2e2dd",
          50: "#e8f1ee",
        },
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
