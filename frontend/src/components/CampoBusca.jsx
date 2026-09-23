import { Search } from "lucide-react";
import { useEffect, useId, useState } from "react";

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
 *
 * `totalResultados` (issue #142): quem enxerga vê a lista encolher enquanto
 * digita; o leitor de tela não. Com a prop, uma região `aria-live` anuncia
 * "N resultados" meio segundo depois da última tecla — sem o atraso, cada
 * letra interromperia a leitura.
 */
export function CampoBusca({ rotulo, valor, aoMudar, totalResultados, placeholder = "Buscar por nome..." }) {
  const id = useId();
  const [anuncio, setAnuncio] = useState("");

  useEffect(() => {
    if (totalResultados === undefined || !valor.trim()) {
      setAnuncio("");
      return undefined;
    }
    const espera = setTimeout(() => {
      setAnuncio(
        totalResultados === 0
          ? "Nenhum resultado"
          : `${totalResultados} ${totalResultados === 1 ? "resultado" : "resultados"}`,
      );
    }, 500);
    return () => clearTimeout(espera);
  }, [valor, totalResultados]);

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
      <p role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </p>
    </div>
  );
}
