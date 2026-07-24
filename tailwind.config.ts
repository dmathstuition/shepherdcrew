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
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: "#04070F", // deepest navy-black
        midnight: "#070C1A", // page base
        night: "#0A1430", // deep navy blue
        deep: "#0E1C41", // raised navy surface
        stage: "#25407C", // steel-blue (banner rails, secondary)
        ember: "#C6A24C", // PRIMARY GOLD accent
        gold: "#E4C77B", // lighter gold highlight
        mist: "#EAEDF7", // near-white text
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
