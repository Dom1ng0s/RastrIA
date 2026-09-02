import { Moon, Sun } from "lucide-react";

import { useThemeStore } from "./store";

export function ThemeToggle({ className = "" }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const proximoTema = theme === "dark" ? "claro" : "escuro";

  return (
    <button
      type="button"
      aria-label={`Mudar para modo ${proximoTema}`}
      title={`Mudar para modo ${proximoTema}`}
      onClick={toggleTheme}
      className={`inline-flex h-5 w-5 items-center justify-center text-text-muted hover:text-primary dark:text-dark-text-muted dark:hover:text-dark-primary ${className}`}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
