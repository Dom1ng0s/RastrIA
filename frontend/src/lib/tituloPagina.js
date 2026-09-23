import { useEffect } from "react";

// Mesmo texto do <title> de index.html — é o que a Landing (e o compartilhamento
// em redes sociais) mostra.
export const TITULO_PADRAO = "Rastria — Seu histórico de saúde, verificado e conectado";

/**
 * Título da aba do navegador por tela (WCAG 2.4.2, eMAG 3.3 — issue #135). O
 * app é SPA, então o <title> de index.html valia para todas as rotas.
 *
 * Recebe as partes do mais específico para o mais geral, e junta com " · " e
 * "Rastria" no fim: `useTituloPagina("João S.", "Painel do Médico")` →
 * "João S. · Painel do Médico · Rastria". Partes vazias são ignoradas; sem
 * nenhuma, volta o título padrão.
 */
export function useTituloPagina(...partes) {
  const preenchidas = partes.filter(Boolean);
  const titulo = preenchidas.length > 0 ? [...preenchidas, "Rastria"].join(" · ") : TITULO_PADRAO;

  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
}
