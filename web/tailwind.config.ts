import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        honey: {
          DEFAULT: "#d68a2e",
          light: "#fdd35f",
          dark: "#5a3a1a",
        },
        ink: "#34243f",
      },
      fontFamily: {
        display: ['var(--font-display)', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        pixel: "4px 4px 0 0 #34243f",
        "pixel-sm": "2px 2px 0 0 #34243f",
      },
    },
  },
  plugins: [],
};
export default config;
