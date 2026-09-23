import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * Painel suspenso aberto por um botão — Ajuda, Notificações, Baixar histórico
 * (issue #139). Padrão "Disclosure" do WAI-ARIA, não "Menu": os três antes
 * declaravam `role="menu"`, que faz o leitor de tela esperar navegação por
 * setas que nunca existiu, e o de notificações ainda misturava lista, links e
 * botões dentro do "menu" (ARIA inválido). Num Disclosure o painel é conteúdo
 * comum logo depois do botão, navegado por Tab.
 *
 * Comportamento:
 * - botão com `aria-expanded` + `aria-controls` apontando para o painel;
 * - Esc fecha e devolve o foco ao botão;
 * - Tab para fora do componente fecha (o painel não fica aberto por cima do
 *   conteúdo que o usuário já está percorrendo);
 * - toque/clique fora fecha (`pointerdown`, que também cobre toque);
 * - `fechar({ devolverFoco: true })` para ações que tiram o item focado da
 *   tela — sem isso o foco cairia no <body>.
 *
 * Uso: `ref={containerRef}` no elemento que envolve botão e painel,
 * `{...propsBotao}` no botão, `{...propsPainel}` no painel (renderizado só
 * quando `aberto`, logo depois do botão no DOM).
 */
export function usePainelSuspenso() {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);
  const botaoRef = useRef(null);
  const painelId = useId();

  const fechar = useCallback(({ devolverFoco = false } = {}) => {
    setAberto(false);
    if (devolverFoco) botaoRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!aberto) return undefined;
    const container = containerRef.current;

    const aoApontar = (evento) => {
      if (container && !container.contains(evento.target)) setAberto(false);
    };
    const aoTeclar = (evento) => {
      if (evento.key !== "Escape") return;
      setAberto(false);
      botaoRef.current?.focus();
    };
    // `relatedTarget` nulo = foco foi para lugar nenhum (ex.: clique em área
    // não focável) — isso já é tratado pelo `pointerdown`.
    const aoSairFoco = (evento) => {
      if (evento.relatedTarget && !container.contains(evento.relatedTarget)) setAberto(false);
    };

    document.addEventListener("pointerdown", aoApontar);
    document.addEventListener("keydown", aoTeclar);
    container?.addEventListener("focusout", aoSairFoco);
    return () => {
      document.removeEventListener("pointerdown", aoApontar);
      document.removeEventListener("keydown", aoTeclar);
      container?.removeEventListener("focusout", aoSairFoco);
    };
  }, [aberto]);

  return {
    aberto,
    fechar,
    containerRef,
    propsBotao: {
      ref: botaoRef,
      "aria-expanded": aberto,
      "aria-controls": painelId,
      onClick: () => setAberto((atual) => !atual),
    },
    propsPainel: { id: painelId },
  };
}
