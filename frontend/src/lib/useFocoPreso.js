import { useEffect, useRef } from "react";

const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamento de diálogo modal (issues #42 e #140), compartilhado por
 * `Modal` e `Gaveta`: enquanto montado,
 * - move o foco para dentro de `ref`: para o elemento que casar com
 *   `seletorFocoInicial`, se houver, senão para o próprio contêiner;
 * - prende o Tab/Shift+Tab dentro dele;
 * - fecha no Esc;
 * - trava o scroll do fundo;
 * e, ao desmontar, devolve o foco a quem estava focado quando abriu. A
 * devolução usa `preventScroll`: fechar uma gaveta ao seguir uma âncora da
 * Landing não pode desfazer a rolagem até a seção.
 *
 * `onClose` fica numa ref — quem chama costuma recriá-lo a cada render, e o
 * efeito precisa rodar só ao montar/desmontar.
 */
export function useFocoPreso(ref, onClose, { seletorFocoInicial } = {}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const gatilho = document.activeElement;
    const { body } = document;
    const overflowAnterior = body.style.overflow;
    body.style.overflow = "hidden";

    const conteiner = ref.current;
    const inicial = seletorFocoInicial ? conteiner?.querySelector(seletorFocoInicial) : null;
    (inicial ?? conteiner)?.focus();

    function aoTeclar(evento) {
      if (evento.key === "Escape") {
        evento.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (evento.key !== "Tab" || !conteiner) return;
      const focaveis = conteiner.querySelectorAll(SELETOR_FOCAVEIS);
      if (focaveis.length === 0) {
        evento.preventDefault();
        return;
      }
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      const ativo = document.activeElement;
      if (evento.shiftKey && (ativo === primeiro || ativo === conteiner)) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && ativo === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar, true);
    return () => {
      document.removeEventListener("keydown", aoTeclar, true);
      body.style.overflow = overflowAnterior;
      if (gatilho instanceof HTMLElement) gatilho.focus({ preventScroll: true });
    };
  }, [ref, seletorFocoInicial]);
}
