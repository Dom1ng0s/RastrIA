import { focarConteudo, ID_CONTEUDO } from "../lib/navegacaoTeclado";

/**
 * Link "Pular para o conteúdo" (WCAG 2.4.1, eMAG 1.5 — issue #134). Renderizado
 * uma única vez, antes das rotas (ver routes/index.jsx), para ser sempre o
 * primeiro elemento focável de qualquer tela. Fica oculto até receber foco.
 *
 * O clique move o foco em vez de seguir o `#conteudo`: assim o fragmento não
 * vai para a URL (onde o `useRolarParaSecao` do painel o trataria como seção).
 * O `href` continua lá para o link ter semântica de link.
 */
export function PularParaConteudo() {
  return (
    <a
      href={`#${ID_CONTEUDO}`}
      onClick={(evento) => {
        if (focarConteudo()) evento.preventDefault();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
    >
      Pular para o conteúdo
    </a>
  );
}
