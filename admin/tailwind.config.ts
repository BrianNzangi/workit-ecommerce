import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
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
            },
        },
    },
    plugins: [],
};

export default config;
