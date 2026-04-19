/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        throne: {
          bg:      "#08080f",
          surface: "#10101c",
          panel:   "#16162a",
          border:  "#2a2a42",
          gold:    "#f5a623",
          gold2:   "#fbbf24",
          gold3:   "#fcd34d",
          purple:  "#7c3aed",
          purple2: "#8b5cf6",
          crimson: "#ef4444",
          text:    "#e8ecf4",
          muted:   "#8b93b0",
          success: "#22c55e",
        },
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        sans:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      animation: {
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float":      "float 3s ease-in-out infinite",
        "shimmer":    "shimmer 2.5s linear infinite",
        "spin-slow":  "spin 8s linear infinite",
        "bounce-sm":  "bounceSm 1s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245,166,35,0.3), 0 0 40px rgba(245,166,35,0.1)" },
          "50%":      { boxShadow: "0 0 40px rgba(245,166,35,0.6), 0 0 80px rgba(245,166,35,0.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        bounceSm: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
