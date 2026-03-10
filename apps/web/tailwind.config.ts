import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9efff",
          500: "#1f8cff",
          700: "#0061c9",
          900: "#002f63"
        }
      },
      boxShadow: {
        card: "0 12px 40px rgba(0, 41, 87, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
