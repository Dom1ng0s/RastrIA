import { defineConfig, devices } from "@playwright/test";

/**
 * Teste de acessibilidade de página inteira (issue #151). Complementa os testes
 * de componente do Vitest: só na página real existem landmarks, ordem de
 * títulos, contraste calculado e as classes da aba Acessibilidade aplicadas no
 * <html>.
 *
 * Roda contra o **build de produção** (`vite preview`), não contra o dev
 * server: é o que a pessoa recebe, e o dev server com HMR injeta scripts que
 * chegaram a mascarar o estado inicial das preferências durante o
 * desenvolvimento deste teste.
 *
 * O build do teste sobe com `VITE_MODO_DEMO=true`: sem ela a reidratação do
 * papel pelo localStorage não existe (issue #128, e é assim que deve ser no
 * piloto) e toda rota de painel cairia no /login — o axe passaria medindo a
 * tela errada. Cada teste afirma o <h1> da tela antes de medir, exatamente
 * para esse engano não passar despercebido.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    env: { VITE_MODO_DEMO: "true" },
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
