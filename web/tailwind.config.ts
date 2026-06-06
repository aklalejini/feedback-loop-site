import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#3a2a18",
        parch: "#ece0c4",
        amber: {
          DEFAULT: "#b06e1c",
          deep: "#8a5310",
          glow: "#e3a23e",
        },
        bottle: {
          DEFAULT: "#386b5b",
          deep: "#2b5446",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 18px -8px rgba(58,40,16,0.35), 0 1px 2px rgba(58,40,16,0.12)",
        lift: "0 12px 28px -10px rgba(58,40,16,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
