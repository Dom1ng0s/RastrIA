import { Search } from "lucide-react";
import { useId } from "react";

/**
 * Campo de busca simples, client-side — usado em listas que crescem com o
 * tamanho da instituição (pacientes, alunos, ranking). Sem debounce
 * proposital: as listas hoje são pequenas (dado mockado) e a filtragem é
 * local, não bate em API nenhuma — não há custo de performance a mitigar.
 * Se um dia a busca passar a ser server-side, debounce entra aqui.
 *
 * `rotulo` é obrigatório (issue #141): o placeholder some ao digitar e não
 * serve de rótulo (WCAG 3.3.2). O rótulo fica visualmente oculto porque o
 * ícone de lupa e o placeholder já dizem o que o campo é para quem enxerga.
 */
export function CampoBusca({ rotulo, valor, aoMudar, placeholder = "Buscar por nome..." }) {
  const id = useId();

  return (
    <div role="search" className="relative">
      <label htmlFor={id} className="sr-only">
        {rotulo}
      </label>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        id={id}
        type="search"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3.5 text-sm text-text-dark"
      />
    </div>
  );
}
