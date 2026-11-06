import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        studio: {
          black: "#050505",
          panel: "#0b0b0d",
          card: "#111113",
          muted: "#a1a1aa",
          line: "rgba(255,255,255,0.09)",
          white: "#f5f5f7",
          accent: "rgb(209, 0, 0)",
        },
      },
      boxShadow: {
        glow: "0 18px 60px rgba(0,0,0,.45)",
        red: "0 0 42px rgba(209,0,0,.22)",
        line: "inset 0 1px 0 rgba(255,255,255,.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
