import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        'extra': {'min': "1400px"},
        'lg': {'min': '1200px'},
        'md': {'max': '1199px'},
        'sm+': {'max': '900px'},
        'sm': {'max': '600px'}
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};

export default config;
