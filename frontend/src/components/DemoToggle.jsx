import { Sparkles, Users } from "lucide-react";

import { MODO_DEMO } from "../features/demo/flag";

/**
 * Alternância só de demonstração (issue #80): como todo dado hoje é mockado e
 * as listas nunca ficam vazias sozinhas, o estado vazio de cada tela nunca é
 * demonstrável na prática. Este controle deixa alguém apresentando o produto
 * (ou testando visualmente) alternar entre "conta com dados" (mock normal) e
 * "conta nova" (mock zerado), sem depender de backend.
 *
 * Não é uma preferência do usuário real — some quando a API existir e as
 * telas passarem a refletir o dado de verdade. Até lá, fica atrás da flag
 * `VITE_MODO_DEMO` (issue #128): a condição mora aqui, e não nas 4 telas que
 * usam o componente, para não haver como esquecer uma delas.
 */
export function DemoToggle({ contaNova, onToggle }) {
  if (!MODO_DEMO) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={contaNova}
      className="mb-4 inline-flex items-center gap-2 rounded-full border border-dashed border-line bg-bg-tint px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-dark"
      title="Alterna a visualização só para demonstração — não afeta dado real."
    >
      {contaNova ? <Sparkles size={14} /> : <Users size={14} />}
      Modo demo: {contaNova ? "conta nova (sem registros)" : "conta com dados"}
    </button>
  );
}
