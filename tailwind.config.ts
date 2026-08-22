import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        foreground: "#0F172A",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        primary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          DEFAULT: "#059669",
          foreground: "#FFFFFF",
        },
        navy: {
          50: "#F0F4F8",
          100: "#D9E2EC",
          500: "#334E68",
          700: "#1E293B",
          800: "#102A43",
          900: "#0F172A",
          DEFAULT: "#0F172A",
        },
        accent: {
          DEFAULT: "#10B981",
          light: "#E6F4EA",
          dark: "#047857",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          dark: "#B45309",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#B91C1C",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        border: "#E2E8F0",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0.95)", opacity: "1" },
          "50%": { transform: "scale(1.3)", opacity: "0.4" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        pulseSlow: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wave: {
          "0%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
          "100%": { transform: "scaleY(0.4)" },
        }
      },
      animation: {
        ripple: "ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        "pulse-slow": "pulseSlow 2.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        wave: "wave 1.2s ease-in-out infinite",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.06)",
        float: "0 10px 30px -5px rgba(5, 150, 105, 0.2)",
      }
    },
  },
  plugins: [],
};

export default config;
