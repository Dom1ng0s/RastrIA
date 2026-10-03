import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { PREFERENCIAS } from "../src/features/acessibilidade/preferencias";

// Varredura axe das telas principais (issue #151), nos temas claro e escuro e
// com as preferências da aba Acessibilidade ligadas.
//
// Falha em qualquer violação, não só serious/critical: hoje a contagem é zero e
// manter assim é mais barato do que negociar o limiar depois. Se alguma regra
// precisar de exceção, ela entra aqui nomeada, com o motivo.

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Papel → rotas que só ele alcança. A chave vira o papel gravado no
// localStorage pelo atalho de modo demo.
// `titulo` é o <h1> esperado: sem ele, uma rota protegida que redirecionasse
// para o /login passaria no axe e o teste ficaria verde testando a tela errada.
const ROTAS = [
  {
    papel: null,
    caminhos: [
      { caminho: "/", titulo: /Centralize/i },
      { caminho: "/login", titulo: /Entrar/i },
      { caminho: "/termos-de-uso", titulo: /Termos de Uso/i },
      { caminho: "/acessibilidade", titulo: /Acessibilidade/i },
    ],
  },
  {
    papel: "usuario",
    caminhos: [
      { caminho: "/usuario", titulo: /Meu Histórico/i },
      { caminho: "/usuario/ranking", titulo: /Ranking/i },
      { caminho: "/perfil?secao=acessibilidade", titulo: /Configurações/i },
    ],
  },
  {
    papel: "comando",
    caminhos: [
      { caminho: "/gerente", titulo: /Painel|Agregado/i },
      { caminho: "/gerente/importar-integrantes", titulo: /Importar/i },
    ],
  },
  { papel: "medico", caminhos: [{ caminho: "/medico", titulo: /Painel|Médico/i }] },
  {
    papel: "educador-fisico",
    caminhos: [{ caminho: "/educador-fisico", titulo: /Painel|Educador/i }],
  },
];

// As preferências que mudam a renderização; ligadas de uma vez, é o cenário
// mais carregado que um usuário consegue produzir.
const PREFERENCIAS_DE_EXIBICAO = {
  altoContraste: true,
  fonteGrande: true,
  espacamentoTexto: true,
  daltonismo: true,
  alvosGrandes: true,
  focoReforcado: true,
};

// O tour guiado abre sozinho na primeira visita a um painel. Nos testes de
// rota ele fica desligado — é a preferência real do app ("Abrir tour guiado
// automaticamente", issue #145) e deixa cada tela no estado que a pessoa vê da
// segunda visita em diante. O tour tem teste próprio no fim do arquivo.
const SEM_TOUR = { abrirTourAutomaticamente: false };

async function prepararSessao(page, { papel, tema = "light", preferencias = null }) {
  // O estado precisa existir antes do primeiro render: o store de
  // acessibilidade aplica as classes no <html> no import do módulo.
  await page.addInitScript(
    ({ papel, tema, preferencias }) => {
      if (papel) {
        localStorage.setItem("rastria:usuario", JSON.stringify({ papel, instituicaoId: 1 }));
      }
      localStorage.setItem("rastria:theme", tema);
      localStorage.setItem("rastria:acessibilidade", JSON.stringify(preferencias));
    },
    { papel, tema, preferencias },
  );
}

async function violacoes(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.map((v) => `${v.id} (${v.impact}) em ${v.nodes.map((n) => n.target).join(" | ")}`);
}

async function abrir(page, caminho, titulo) {
  await page.goto(caminho);
  await page.waitForLoadState("networkidle");
  // Confirma que estamos na tela certa antes de medir: sem isto, uma rota
  // protegida que redirecionasse para o /login passaria no axe medindo a tela
  // errada. De quebra, afirma a regra de um <h1> por tela (issue #146).
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(titulo);
}

for (const { papel, caminhos } of ROTAS) {
  for (const { caminho, titulo } of caminhos) {
    for (const tema of ["light", "dark"]) {
      test(`axe: ${caminho} (tema ${tema})`, async ({ page }) => {
        await prepararSessao(page, { papel, tema, preferencias: SEM_TOUR });
        await abrir(page, caminho, titulo);
        expect(await violacoes(page)).toEqual([]);
      });
    }

    test(`axe: ${caminho} com as preferências de exibição ligadas`, async ({ page }) => {
      await prepararSessao(page, { papel, preferencias: { ...SEM_TOUR, ...PREFERENCIAS_DE_EXIBICAO } });
      await abrir(page, caminho, titulo);
      expect(await violacoes(page)).toEqual([]);
    });
  }
}

// Cada preferência com classe, uma por vez: ligada, recarregada, classe no
// <html> e axe limpo com ela ativa. A lista vem de `preferencias.js`, então
// preferência nova entra neste teste sozinha.
const COM_CLASSE = Object.entries(PREFERENCIAS).filter(([, def]) => def.classe);

for (const [chave, { classe }] of COM_CLASSE) {
  test(`preferência ${chave}: aplica .${classe} no <html> e segue acessível`, async ({ page }) => {
    await prepararSessao(page, { papel: "usuario", preferencias: { ...SEM_TOUR, [chave]: true } });
    await page.goto("/perfil?secao=acessibilidade");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("html")).toHaveClass(new RegExp(String.raw`\b${classe}\b`));
    expect(await violacoes(page)).toEqual([]);
  });
}

test("tour guiado aberto continua acessível", async ({ page }) => {
  await prepararSessao(page, { papel: "medico", preferencias: { abrirTourAutomaticamente: true } });
  await page.goto("/medico");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("alertdialog")).toBeVisible();
  expect(await violacoes(page)).toEqual([]);
});

test("reflow em 320px, sem rolagem horizontal (WCAG 1.4.10)", async ({ page }) => {
  await prepararSessao(page, { papel: "usuario", preferencias: SEM_TOUR });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/usuario/ranking");
  await page.waitForLoadState("networkidle");

  const temRolagemHorizontal = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(temRolagemHorizontal).toBe(false);
});
