import { create } from "zustand";

const STORAGE_KEY = "rastria:theme";

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

// Aplicado assim que o módulo é importado (ver main.jsx) para evitar flash de
// tema errado antes da primeira renderização.
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
}));
