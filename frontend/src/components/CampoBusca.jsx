import { Search } from "lucide-react";

/**
 * Campo de busca simples, client-side — usado em listas que crescem com o
 * tamanho da instituição (pacientes, alunos, ranking). Sem debounce
 * proposital: as listas hoje são pequenas (dado mockado) e a filtragem é
 * local, não bate em API nenhuma — não há custo de performance a mitigar.
 * Se um dia a busca passar a ser server-side, debounce entra aqui.
 */
export function CampoBusca({ valor, aoMudar, placeholder = "Buscar por nome..." }) {
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3.5 text-sm text-text-dark"
      />
    </div>
  );
}
