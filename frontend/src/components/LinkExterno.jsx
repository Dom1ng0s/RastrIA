import { ExternalLink } from "lucide-react";

import { useAcessibilidadeStore } from "../features/acessibilidade/store";

/**
 * Link para conteúdo fora do fluxo das telas (anexo de exame, arquivo servido
 * direto) — issue #148.
 *
 * Nova aba sem aviso quebra duas coisas: quem usa leitor de tela perde o botão
 * "Voltar" sem entender por quê (WCAG 2.4.4 / 3.2.5, eMAG 1.9). Então o padrão
 * é abrir na mesma aba; quem preferir nova aba liga isso em Configurações ›
 * Acessibilidade, e aí o link **avisa** que abre em nova aba.
 *
 * `descricao` entra como complemento `sr-only` do nome acessível (ex.: o índice
 * e a data do exame), para o link não ser só "Visualizar anexo" numa lista com
 * vários.
 */
export function LinkExterno({ href, children, descricao, className = "", ...resto }) {
  const mesmaAba = useAcessibilidadeStore((state) => state.abrirLinksMesmaAba);

  return (
    <a
      href={href}
      {...(mesmaAba ? {} : { target: "_blank", rel: "noreferrer" })}
      className={className}
      {...resto}
    >
      {children}
      {descricao && <span className="sr-only"> — {descricao}</span>}
      {!mesmaAba && (
        <>
          <span className="sr-only"> (abre em nova aba)</span>
          <ExternalLink size={12} aria-hidden="true" className="ml-1 inline shrink-0" />
        </>
      )}
    </a>
  );
}
