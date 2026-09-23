import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useFocoPreso } from "../lib/useFocoPreso";

/**
 * Gaveta lateral de navegação no celular (issue #140) — painel do
 * DashboardLayout e menu da Landing. É um diálogo modal: `role="dialog"` +
 * `aria-modal`, foco preso, Esc fecha, foco volta ao botão que abriu (ver
 * lib/useFocoPreso.js, o mesmo comportamento do Modal). Antes as duas gavetas
 * deixavam o Tab escapar para a página coberta pelo fundo escuro.
 *
 * O fundo escuro é só visual (`aria-hidden`, fecha no clique/toque): antes era
 * um segundo botão "Fechar menu" do tamanho da tela, repetido na ordem do Tab.
 *
 * Só existe abaixo do breakpoint `md` do Tailwind (`md:hidden`). Se a janela
 * cresce com ela aberta, fecha — senão o foco ficaria preso num painel que o
 * `md:hidden` escondeu.
 *
 * Renderiza em `document.body` via portal: um ancestral com `backdrop-filter`
 * (o header da Landing) vira "containing block" de `position: fixed` e a
 * gaveta ficava presa na altura do header.
 */
const ACIMA_DO_MD = "(min-width: 768px)";
// Ao abrir, o foco vai para o primeiro link da navegação (é para isso que a
// gaveta foi aberta), não para o botão de fechar.
const FOCO_INICIAL = "[data-navegacao-principal] a[href], [data-navegacao-principal] button";

export function Gaveta({ id, rotulo, onFechar, lado = "esquerda", className = "", children }) {
  const painelRef = useRef(null);
  useFocoPreso(painelRef, onFechar, { seletorFocoInicial: FOCO_INICIAL });

  const onFecharRef = useRef(onFechar);
  onFecharRef.current = onFechar;
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const consulta = window.matchMedia(ACIMA_DO_MD);
    const aoMudar = () => {
      if (consulta.matches) onFecharRef.current();
    };
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-40 md:hidden">
      <div aria-hidden="true" onClick={onFechar} className="absolute inset-0 bg-primary/40" />
      <div
        ref={painelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
        tabIndex={-1}
        className={`absolute top-0 flex h-full flex-col ${lado === "direita" ? "right-0" : "left-0"} ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
