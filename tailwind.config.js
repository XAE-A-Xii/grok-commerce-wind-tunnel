/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#070A0F",
        surface: "#0D131F",
        "surface-border": "#1E293B",
        primary: {
          DEFAULT: "#10B981",
          hover: "#059669",
          glow: "rgba(16, 185, 129, 0.15)",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          glow: "rgba(6, 182, 212, 0.15)",
        },
        crimson: {
          DEFAULT: "#EF4444",
          glow: "rgba(239, 68, 68, 0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
