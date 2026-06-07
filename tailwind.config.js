/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f7ff",
          100: "#b3e7ff",
          200: "#80d7ff",
          300: "#4dc7ff",
          400: "#1ab7ff",
          500: "#00a3e6",
          600: "#007fb3",
          700: "#005b80",
          800: "#00374d",
          900: "#00131a",
        },
        tech: {
          blue: "#00D4FF",
          cyan: "#00F5D4",
          purple: "#A855F7",
        },
        status: {
          normal: "#34C759",
          warning: "#FF8C00",
          alarm: "#FF3B30",
          info: "#007AFF",
        },
        dark: {
          50: "#F2F4F7",
          100: "#E4E7EC",
          200: "#D0D5DD",
          300: "#98A2B3",
          400: "#667085",
          500: "#344054",
          600: "#1D2939",
          700: "#101828",
          800: "#0A1628",
          900: "#050D1A",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        sans: ["Noto Sans SC", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "blink": "blink 1s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 212, 255, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.8)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
