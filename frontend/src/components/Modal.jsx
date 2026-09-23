import { useRef } from "react";
import { createPortal } from "react-dom";

import { useFocoPreso } from "../lib/useFocoPreso";

// Diálogo modal acessível reutilizável (ver issue #42). Responsabilidades:
// role/aria de diálogo, fechar no Esc, fechar ao clicar no backdrop, trapear o
// Tab dentro do diálogo, mover o foco para dentro ao abrir e devolvê-lo a quem
// abriu ao fechar, e travar o scroll do fundo — tudo em lib/useFocoPreso.js,
// compartilhado com a Gaveta (issue #140). Renderiza em `document.body` via
// portal (mesmo motivo do menu mobile da Landing — evita ficar preso em
// containing block de ancestral com `transform`/`backdrop-blur`).
export function Modal({ tituloId, onClose, children, className = "" }) {
  const dialogoRef = useRef(null);
  useFocoPreso(dialogoRef, onClose);

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-primary/35 p-4"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <div ref={dialogoRef} role="dialog" aria-modal="true" aria-labelledby={tituloId} tabIndex={-1} className={`outline-none ${className}`}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
