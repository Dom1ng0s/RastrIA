/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0C4A44",
        seafoam: "#14B892",
        coral: "#FF6B4A",
        "text-dark": "#1B2C29",
        "text-muted": "#5B6B67",
        "bg-tint": "#F2F8F6",
      },
      fontFamily: {
        heading: ["Cambria", "serif"],
        body: ["Calibri", "sans-serif"],
      },
    },
  },
  plugins: [],
};
