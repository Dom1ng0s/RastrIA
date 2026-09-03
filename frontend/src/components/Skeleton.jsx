/**
 * Placeholder de carregamento (issue #120). Enquanto todo dado era mockado e
 * síncrono nenhuma tela tinha estado de loading; quando as queries reais
 * (`features/<área>/queries.js`, issue #119) substituírem os mocks, toda tela
 * que consome um hook precisa tratar `isLoading` — este é o bloco reutilizável.
 *
 * A cor vem da classe `.skeleton` do design system (`styles/index.css`), com
 * override de tema escuro lá — nada de hex aqui.
 *
 * Variantes: "linha" (uma barra), "texto" (N linhas, última mais curta),
 * "circulo" (avatar/ícone), "card" e "linha-tabela" (item de lista).
 */
function Barra({ className = "" }) {
  return <div className={`skeleton h-4 ${className}`} />;
}

export function Skeleton({ variante = "texto", linhas = 3, className = "" }) {
  if (variante === "circulo") {
    return <div className={`skeleton h-10 w-10 rounded-full ${className}`} aria-hidden="true" />;
  }

  if (variante === "linha") {
    return <Barra className={`w-full ${className}`} />;
  }

  if (variante === "linha-tabela") {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ${className}`}
        aria-hidden="true"
      >
        <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Barra className="w-1/3" />
          <Barra className="h-3 w-1/2" />
        </div>
        <div className="skeleton h-5 w-16 shrink-0 rounded-full" />
      </div>
    );
  }

  if (variante === "card") {
    return (
      <div className={`rounded-xl bg-white p-4 shadow-sm ${className}`} aria-hidden="true">
        <div className="flex items-center justify-between">
          <Barra className="w-2/5" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        <Barra className="mt-3 h-3 w-1/3" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: linhas }).map((_, indice) => (
        <Barra key={indice} className={indice === linhas - 1 ? "w-2/3" : "w-full"} />
      ))}
    </div>
  );
}

/**
 * Lista de skeletons com o rótulo acessível de carregamento já embutido — uso
 * mais comum ao trocar um `.map()` de lista pelo estado de loading.
 */
export function SkeletonLista({ itens = 3, variante = "linha-tabela", className = "" }) {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Carregando">
      {Array.from({ length: itens }).map((_, indice) => (
        <Skeleton key={indice} variante={variante} />
      ))}
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
