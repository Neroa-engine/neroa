import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        mist: "#F5F7FA",
        brand: {
          50: "#eef7ff",
          100: "#d8ebff",
          200: "#badcff",
          300: "#8dc6ff",
          400: "#59a7ff",
          500: "#2d89ff",
          600: "#146cf0",
          700: "#0d54d0",
          800: "#1246a8",
          900: "#153d84"
        }
      },
      boxShadow: {
        soft: "0 24px 80px -32px rgba(16, 24, 40, 0.25)"
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
