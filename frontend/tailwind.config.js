/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0C4A44",
        "primary-dark": "#083430",
        seafoam: "#14B892",
        coral: "#FF6B4A",
        // Variantes das cores de marca para TEXTO, ÍCONE e fundo de texto
        // branco (issue #137): coral e seafoam têm só ~2,5–2,8:1 sobre branco,
        // abaixo do mínimo de 4,5:1 do WCAG. No tema escuro as originais passam
        // e voltam a valer (overrides em styles/index.css).
        "coral-escuro": "#B8431F",
        "seafoam-escuro": "#0B7A5E",
        // Borda de campo de formulário: ≥ 3:1 com o fundo (WCAG 1.4.11). O
        // `line` (1,3:1) segue para separadores e cards, que não são controles.
        "borda-campo": "#7C8C88",
        "dark-borda-campo": "#6B7F7A",
        "medalha-ouro": "#8A6700",
        "medalha-prata": "#737373",
        "medalha-bronze": "#9A5424",
        "text-dark": "#1B2C29",
        "text-muted": "#5B6B67",
        "bg-tint": "#F2F8F6",
        line: "#E4E4E4",
        "dark-bg": "#0F1715",
        "dark-surface": "#16211E",
        "dark-line": "#283733",
        "dark-text": "#E7F2EF",
        "dark-text-muted": "#8FA39E",
        "dark-primary": "#3FCBAE",
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
