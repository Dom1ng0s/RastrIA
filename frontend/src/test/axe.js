import { axe } from "vitest-axe";

// Configuração única do axe para os testes de componente (issue #151).
//
// Dois ajustes importantes:
// - `color-contrast` fica desligado: o jsdom não calcula estilo de verdade, e a
//   regra só produziria resultado sem valor aqui. Contraste é verificado no
//   teste de página (Playwright) e no roteiro manual.
// - `region` fica desligado: um componente renderizado isolado não tem o <main>
//   da tela em volta. A regra vale na página inteira, e lá ela roda.
const REGRAS_DESLIGADAS = {
  "color-contrast": { enabled: false },
  region: { enabled: false },
};

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export function analisar(container, { rules = {} } = {}) {
  return axe(container, {
    runOnly: { type: "tag", values: TAGS },
    rules: { ...REGRAS_DESLIGADAS, ...rules },
  });
}

/** Mensagem legível quando falha — sem isto o diff do axe é ilegível. */
export function descreverViolacoes(resultado) {
  return resultado.violations
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)
    .join("\n");
}
