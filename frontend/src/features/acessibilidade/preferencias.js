/**
 * Definição das preferências de acessibilidade — **dado puro, sem efeito
 * colateral** (issue #151): o store aplica classes e lê o localStorage no
 * import, o que impede um teste de fora do navegador (ex: Playwright) de
 * importar a lista. Por isso ela mora aqui sozinha.
 */
// Preferências de acessibilidade (issues #95 e #149). Toda preferência
// configurável de acessibilidade mora aqui e aparece em Configurações ›
// Acessibilidade — nenhuma tela guarda a sua. Correção de conformidade
// (WCAG AA / eMAG) NÃO entra nesta lista: vale para todos, sempre.
//
// Client-side por ora (localStorage, mesmo padrão de `features/theme/store.js`);
// migram para preferência real do usuário (GET/PATCH /api/usuarios/me) quando
// o endpoint existir.
//
// Para acrescentar uma preferência, basta uma entrada em PREFERENCIAS:
// - `padrao`     → valor enquanto o usuário não escolher;
// - `classe`     → classe alternada no <html> (o efeito visual mora em
//                  `styles/index.css`); sem ela, quem consome lê o store;
// - `mediaQuery` → quando existe, o padrão vem da preferência do sistema
//                  operacional (e acompanha mudanças nela) até o usuário
//                  escolher explicitamente;
// - `opcoes`     → para preferência de múltipla escolha (não liga/desliga):
//                  os valores aceitos. Sem `opcoes`, a preferência é booleana.
export const PREFERENCIAS = {
  fonteGrande: { padrao: false, classe: "fonte-grande" },
  // Escopo ainda será refinado com a equipe (issue #95).
  modoSimplificado: { padrao: false, classe: "modo-simplificado" },
  espacamentoTexto: { padrao: false, classe: "espacamento-texto" },
  // Paleta de estados em azul/laranja no lugar de verde/vermelho (issue #138).
  // Complementa — não substitui — os rótulos em texto, que valem para todos.
  daltonismo: { padrao: false, classe: "daltonismo" },
  altoContraste: {
    padrao: false,
    classe: "alto-contraste",
    mediaQuery: "(prefers-contrast: more)",
  },
  reduzirMovimento: {
    padrao: false,
    classe: "reduzir-movimento",
    mediaQuery: "(prefers-reduced-motion: reduce)",
  },
  // Desligado, o tour guiado só abre pelo menu Ajuda (issue #145). Lido por
  // `features/tour/useGuidedTour.js`.
  abrirTourAutomaticamente: { padrao: true },
  // Atalhos Alt+1/Alt+2 do eMAG (issue #134), lidos por `AtalhosTeclado.jsx`.
  atalhosTeclado: { padrao: true },
  focoReforcado: { padrao: false, classe: "foco-reforcado" },
  alvosGrandes: { padrao: false, classe: "alvos-grandes" },
  // Lido por `AnuncioDeRota.jsx` (issue #135).
  focarTituloAoNavegar: { padrao: true },
  // Ligado (padrão), anexos e links externos abrem na mesma aba — nova aba tira
  // o "Voltar" de quem usa leitor de tela. Desligado, abre em nova aba e o
  // link avisa isso no texto. Lido por `components/LinkExterno.jsx` (issue #148).
  abrirLinksMesmaAba: { padrao: true },
  // Segundos que um aviso de sucesso fica na tela; 0 = até o usuário fechar.
  // Avisos de erro sempre ficam até fechar. Lido pelo ToastProvider (#142).
  duracaoAvisos: { padrao: 5, opcoes: [5, 10, 20, 0] },
};
