import type { Config } from "tailwindcss";

/**
 * Brand palette: Deep Navy Blue + Gold + White.
 *
 * The token names are kept from the earlier build so existing class names keep
 * working, but their values now express the premium navy/gold/white identity.
 * `ember` (once orange) is now the primary gold accent, so gold flows through
 * the whole site without touching every component.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fixed navy tones — used for image overlays and gold-button text,
        // which stay dark in both themes.
        abyss: "#04070F",
        midnight: "#070C1A",
        night: "#0A1430",
        deep: "#0E1C41",
        stage: "#25407C", // steel-blue (banner rails, secondary)
        ember: "#C6A24C", // PRIMARY GOLD accent (both themes)
        gold: "#B8912F", // deeper gold, legible on light and dark
        mist: "#EAEDF7",

        // Theme-aware semantic tokens (light default, dark via .dark).
        canvas: "rgb(var(--c-canvas) / <alpha-value>)", // page background
        surface: "rgb(var(--c-surface) / <alpha-value>)", // cards
        surface2: "rgb(var(--c-surface2) / <alpha-value>)", // inputs / raised
        line: "rgb(var(--c-line) / <alpha-value>)", // borders
        ink: "rgb(var(--c-ink) / <alpha-value>)", // primary text
        muted: "rgb(var(--c-muted) / <alpha-value>)", // secondary text
        faint: "rgb(var(--c-faint) / <alpha-value>)", // tertiary text
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "1200px",
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      transitionTimingFunction: {
        reveal: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        coin: "0 18px 40px -18px rgba(4,7,15,0.8)",
      },
    },
  },
  plugins: [],
};

export default config;
