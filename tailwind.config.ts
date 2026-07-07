import type { Config } from "tailwindcss";

// Design tokens — Wallet Primitive
// Signature: "ledger tape" motif — hairline kobo-precision strips, monospace
// running-balance numerals, amber settlement accent against deep ink navy.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07090D",
          900: "#0A0E14",
          800: "#10151D",
          700: "#161C26",
          600: "#212934",
          500: "#333E4C",
        },
        paper: {
          50: "#F7F8FA",
          100: "#ECEFF2",
          200: "#D9DEE5",
        },
        amber: {
          400: "#3B82F6",
          500: "#0066FF",
          600: "#0052CC",
        },
        signal: {
          blue: "#5B8DEF",
          green: "#3FB97F",
          red: "#E5544D",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
        "glow-amber":
          "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(245,166,35,0.12), transparent 70%)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-40px) scale(1.08)" },
          "66%": { transform: "translate(-25px,25px) scale(0.95)" },
        },
        tick: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blob: "blob 14s ease-in-out infinite",
        tick: "tick 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
