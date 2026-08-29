import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

/**
 * Campo de senha com botão de mostrar/ocultar ("olhinho"). Usa forwardRef
 * porque o react-hook-form (register()) precisa anexar sua própria ref ao
 * <input> de verdade — sem isso, o registro do campo não funciona.
 *
 * Reutilizado em qualquer tela que peça senha (Login, PrimeiroAcesso,
 * RedefinirSenha) — não é um componente de uma tela só.
 */
export const PasswordInput = forwardRef(function PasswordInput({ id, className = "", ...props }, ref) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        ref={ref}
        type={visivel ? "text" : "password"}
        className={`w-full rounded-lg border border-line bg-white px-3.5 py-2.5 pr-11 text-sm text-text-dark ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisivel((atual) => !atual)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
      >
        {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});
