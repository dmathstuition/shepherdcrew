import type { Config } from "tailwindcss";

/**
 * Palette is lifted from the ministry's own material:
 * the blue stage wash of a night vigil, against the ember orange of the logo flame.
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
        abyss: "#050813",
        midnight: "#070B1E",
        night: "#0B1230",
        deep: "#101A3D",
        stage: "#2148B8",
        ember: "#F26A21",
        gold: "#FFC24B",
        mist: "#E6E9F5",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "1240px",
      },
      transitionTimingFunction: {
        reveal: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
