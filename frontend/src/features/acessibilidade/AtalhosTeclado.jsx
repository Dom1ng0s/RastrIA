import { useEffect } from "react";

import { focarConteudo, focarNavegacao } from "../../lib/navegacaoTeclado";
import { useAcessibilidadeStore } from "./store";

// Atalhos de teclado padrão do eMAG (issue #134): Alt+1 vai para o conteúdo,
// Alt+2 para a navegação principal. Montado uma vez em routes/index.jsx, como
// o SessaoInativa.
//
// Usa `evento.code` (tecla física), não `evento.key`: no macOS Option+1 produz
// "¡", e o atalho precisa funcionar igual. Alguns navegadores no Linux usam
// Alt+número para trocar de aba — por isso o usuário pode desligar os atalhos
// em Configurações › Acessibilidade.
const ACOES = {
  Digit1: focarConteudo,
  Numpad1: focarConteudo,
  Digit2: focarNavegacao,
  Numpad2: focarNavegacao,
};

export function AtalhosTeclado() {
  const ativo = useAcessibilidadeStore((state) => state.atalhosTeclado);

  useEffect(() => {
    if (!ativo) return undefined;

    const aoTeclar = (evento) => {
      if (!evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
      const acao = ACOES[evento.code];
      if (acao?.()) evento.preventDefault();
    };

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [ativo]);

  return null;
}
