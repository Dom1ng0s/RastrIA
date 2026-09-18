/**
 * Modo demonstração (issue #128).
 *
 * O app carrega dois controles que só existem porque ainda não há backend:
 *
 * 1. o atalho "entrar direto como..." do Login, que define papel e navega para
 *    o dashboard SEM nenhuma credencial;
 * 2. o `DemoToggle` ("conta nova / conta com dados"), que esvazia as listas
 *    para tornar os estados vazios demonstráveis.
 *
 * Enquanto não existe autenticação real nem dado real, os dois são inofensivos
 * e necessários — é assim que o produto é apresentado à PMAL. No dia em que a
 * API entrar, o primeiro vira um bypass de autenticação e de papel exposto na
 * tela pública de login (mesmo risco que as issues #103 e #59 tratam no
 * backend), e o segundo vira um botão que confunde quem está usando o sistema
 * de verdade.
 *
 * Esta flag separa os dois mundos: o build de demonstração continua com tudo,
 * o build de piloto/produção não expõe nenhum dos dois.
 *
 * - `VITE_MODO_DEMO=true`  liga explicitamente (ex: deploy de demonstração)
 * - `VITE_MODO_DEMO=false` desliga explicitamente, inclusive em desenvolvimento
 * - ausente: liga só em desenvolvimento (`npm run dev`), desliga no build
 *
 * A remoção definitiva do atalho de login continua amarrada à integração real
 * com a API — esta flag reduz a exposição, não substitui essa remoção.
 */
const configurado = import.meta.env.VITE_MODO_DEMO;

export const MODO_DEMO =
  configurado === undefined ? import.meta.env.DEV : configurado === "true";
