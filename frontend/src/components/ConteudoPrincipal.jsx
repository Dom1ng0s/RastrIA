import { ID_CONTEUDO } from "../lib/navegacaoTeclado";

/**
 * Região `<main>` de uma tela — destino do "Pular para o conteúdo" e do
 * atalho Alt+1 (issue #134). Toda rota deve ter exatamente uma.
 *
 * `tabIndex={-1}` permite receber foco por script sem entrar na ordem do Tab;
 * sem contorno porque é um contêiner, não um controle (o anel de foco ficaria
 * em volta da página inteira).
 */
export function ConteudoPrincipal({ className = "", children }) {
  return (
    <main id={ID_CONTEUDO} tabIndex={-1} className={`outline-none ${className}`}>
      {children}
    </main>
  );
}
