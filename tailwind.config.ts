import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf7f6",
          100: "#d4ece8",
          500: "#1f8a83",
          600: "#176e69",
          700: "#145854"
        },
        ink: "#202124",
        line: "#d9dee3"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(31, 42, 55, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
