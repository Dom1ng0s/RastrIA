/**
 * Alvos de navegação por teclado compartilhados pelo link "Pular para o
 * conteúdo" e pelos atalhos Alt+1/Alt+2 do eMAG (issue #134).
 *
 * - Conteúdo: o `<main id="conteudo">` de cada tela (ver ConteudoPrincipal.jsx).
 * - Navegação: marcada com `data-navegacao-principal`, não com `id`, porque a
 *   sidebar é renderizada duas vezes no painel (fixa no desktop e gaveta no
 *   mobile). Quando nenhuma navegação está visível (celular com a gaveta
 *   fechada), o foco vai para o botão que a abre (`data-abrir-menu`).
 */
export const ID_CONTEUDO = "conteudo";

const SELETOR_FOCAVEL = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visivel(elemento) {
  return elemento.getClientRects().length > 0;
}

export function focarConteudo() {
  const conteudo = document.getElementById(ID_CONTEUDO);
  if (!conteudo) return false;
  conteudo.focus();
  return true;
}

export function focarNavegacao() {
  const navegacao = [...document.querySelectorAll("[data-navegacao-principal]")].find(visivel);
  const primeiroLink = navegacao && [...navegacao.querySelectorAll(SELETOR_FOCAVEL)].find(visivel);
  if (primeiroLink) {
    primeiroLink.focus();
    return true;
  }

  const abrirMenu = [...document.querySelectorAll("[data-abrir-menu]")].find(visivel);
  if (!abrirMenu) return false;
  abrirMenu.focus();
  return true;
}
