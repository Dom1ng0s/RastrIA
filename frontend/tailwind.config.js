/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0C4A44",
        "primary-dark": "#083430",
        seafoam: "#14B892",
        coral: "#FF6B4A",
        "text-dark": "#1B2C29",
        "text-muted": "#5B6B67",
        "bg-tint": "#F2F8F6",
        line: "#E4E4E4",
      },
      fontFamily: {
        // Web app: Lora/Inter (via Google Fonts, ver index.html). Cambria/Calibri
        // continuam sendo a escolha para materiais impressos/Office — ver
        // "Identidade de Marca" em agents/claude.md.
        heading: ["Lora", "serif"],
        body: ["Inter", "sans-serif"],
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
