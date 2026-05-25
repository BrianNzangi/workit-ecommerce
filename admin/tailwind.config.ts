import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Hanken Grotesk", "system-ui", "-apple-system", "sans-serif"],
            },
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
        },
    },
    plugins: [],
};

export default config;
