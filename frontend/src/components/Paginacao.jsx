import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { paginasVisiveis } from "../lib/paginacao";

/**
 * Paginação numerada para listas (issue #121). Padrão escolhido em vez de
 * "carregar mais"/rolagem infinita: rolagem automática impede alcançar o
 * rodapé (WCAG 2.4.1/2.2.2), e a numeração dá ao leitor de tela um "página 2
 * de 5" estável.
 *
 * Acessibilidade (auditoria WCAG 2.2 AA / eMAG, #152):
 * - `<nav>` com `rotulo` próprio, para não confundir com a navegação principal;
 * - página atual com `aria-current="page"` e destaque que não é só cor (fundo
 *   cheio + negrito, #138);
 * - anterior/próxima com nome ("Página anterior"); alvo de 36 px (≥ 24 px do
 *   WCAG 2.5.8; ≥ 44 px com "Botões maiores", #144, pela regra
 *   `html.alvos-grandes button` do index.css);
 * - ao trocar de página, o foco vai para `alvoFoco` (o título/início da
 *   lista) e uma região viva anuncia "Página 2 de 5". A região existe desde a
 *   montagem — região criada junto com o texto costuma não ser lida.
 *
 * Funciona igual para paginação client-side (fatiar com `paginar` de
 * lib/paginacao.js) e server-side (`aoMudarPagina` busca `?page=N`).
 * Com uma página só, não renderiza a navegação.
 */
export function Paginacao({ paginaAtual, totalPaginas, aoMudarPagina, alvoFoco, rotulo = "Paginação" }) {
  const [anuncio, setAnuncio] = useState("");

  function irPara(pagina) {
    if (pagina < 1 || pagina > totalPaginas || pagina === paginaAtual) return;
    aoMudarPagina(pagina);
    setAnuncio(`Página ${pagina} de ${totalPaginas}`);
    const alvo = alvoFoco?.current;
    if (alvo) {
      if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
      alvo.focus();
    }
  }

  const botao =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      {totalPaginas > 1 && (
        <nav aria-label={rotulo} className="mt-4">
          <ul className="flex flex-wrap items-center gap-1.5">
            <li>
              <button
                type="button"
                onClick={() => irPara(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                aria-label="Página anterior"
                className={`${botao} border-line text-text-dark hover:bg-bg-tint`}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
            </li>
            {paginasVisiveis(paginaAtual, totalPaginas).map((pagina, indice) =>
              pagina === null ? (
                // Reticências: enfeite visual; o leitor de tela já ouve os números.
                <li key={`reticencias-${indice}`} aria-hidden="true" className="px-1 text-sm text-text-muted">
                  …
                </li>
              ) : (
                <li key={pagina}>
                  <button
                    type="button"
                    onClick={() => irPara(pagina)}
                    aria-label={`Página ${pagina}`}
                    aria-current={pagina === paginaAtual ? "page" : undefined}
                    className={`${botao} ${
                      pagina === paginaAtual
                        ? "border-primary bg-primary font-semibold text-white"
                        : "border-line font-medium text-text-dark hover:bg-bg-tint"
                    }`}
                  >
                    {pagina}
                  </button>
                </li>
              ),
            )}
            <li>
              <button
                type="button"
                onClick={() => irPara(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
                aria-label="Próxima página"
                className={`${botao} border-line text-text-dark hover:bg-bg-tint`}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </li>
          </ul>
        </nav>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </p>
    </>
  );
}
