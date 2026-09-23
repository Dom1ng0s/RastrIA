import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAcessibilidadeStore } from "./store";

// Troca de página em SPA não recarrega nada: o leitor de tela não anuncia a
// nova página e o foco fica no link clicado (ou cai no <body>). Issue #135.
//
// A cada mudança de `pathname` (não de hash — rolagem para seção é tratada no
// DashboardLayout, #129; nem de query — as abas de Configurações), faz UMA de
// duas coisas:
// - com "Levar o foco ao título" ligado (padrão), foca o <h1> visível da
//   página: o leitor de tela lê o título e o próximo Tab já parte da página
//   nova, não do fim da sidebar;
// - desligado, ou sem <h1> visível, só anuncia o novo título por uma região
//   `aria-live` que existe desde o início (região criada junto com o texto
//   costuma não ser lida).
// Na primeira carga não faz nada: o navegador já anuncia a página. Compara
// com o pathname anterior em vez de uma flag de "primeira vez" porque o
// StrictMode roda o efeito duas vezes na montagem.
//
// Montado depois de <Routes> (routes/index.jsx) e lido num requestAnimationFrame
// para rodar depois que a página nova já definiu o `document.title`.

function tituloVisivel() {
  return [...document.querySelectorAll("h1")].find((h1) => h1.getClientRects().length > 0);
}

export function AnuncioDeRota() {
  const { pathname } = useLocation();
  const [mensagem, setMensagem] = useState("");
  const pathnameAnterior = useRef(pathname);

  useEffect(() => {
    if (pathnameAnterior.current === pathname) return undefined;
    pathnameAnterior.current = pathname;

    const quadro = requestAnimationFrame(() => {
      const titulo = tituloVisivel();
      if (useAcessibilidadeStore.getState().focarTituloAoNavegar && titulo) {
        titulo.setAttribute("tabindex", "-1");
        titulo.focus();
        setMensagem("");
        return;
      }
      setMensagem(document.title);
    });
    return () => cancelAnimationFrame(quadro);
  }, [pathname]);

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {mensagem}
    </div>
  );
}
