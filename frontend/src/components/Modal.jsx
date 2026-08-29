import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Diálogo modal acessível reutilizável (ver issue #42). Responsabilidades:
// role/aria de diálogo, fechar no Esc, fechar ao clicar no backdrop, trapear o
// Tab dentro do diálogo, mover o foco para dentro ao abrir e devolvê-lo a quem
// abriu ao fechar, e travar o scroll do fundo. Renderiza em `document.body` via
// portal (mesmo motivo do menu mobile da Landing — evita ficar preso em
// containing block de ancestral com `transform`/`backdrop-blur`).
const SELETOR_FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ tituloId, onClose, children, className = "" }) {
  const dialogoRef = useRef(null);
  // `onClose` costuma ser recriado a cada render de quem chama; guardar numa ref
  // deixa o efeito rodar só uma vez (montar/desmontar), sem re-trapear foco.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const gatilho = document.activeElement;
    const { body } = document;
    const overflowAnterior = body.style.overflow;
    body.style.overflow = "hidden";

    const dialogo = dialogoRef.current;
    dialogo?.focus();

    function aoTeclar(evento) {
      if (evento.key === "Escape") {
        evento.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (evento.key !== "Tab" || !dialogo) return;
      const focaveis = dialogo.querySelectorAll(SELETOR_FOCAVEIS);
      if (focaveis.length === 0) {
        evento.preventDefault();
        return;
      }
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      const ativo = document.activeElement;
      if (evento.shiftKey && (ativo === primeiro || ativo === dialogo)) {
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
      if (gatilho instanceof HTMLElement) gatilho.focus();
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-primary/35 p-4"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <div ref={dialogoRef} role="dialog" aria-modal="true" aria-labelledby={tituloId} tabIndex={-1} className={className}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
