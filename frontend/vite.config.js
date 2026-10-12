import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

import { montarCsp, montarServeJson, origemParaCsp } from "./config/csp.js";

// Headers de segurança gerados no build (issues #111 e #192). O header HTTP de
// verdade é servido pelo `serve` a partir do `serve.json` que este plugin emite
// em dist/; a mesma CSP vai como <meta> no index.html, como defesa em
// profundidade para o caso de o app ser aberto sem passar pelo servidor
// configurado. As duas saem de `config/csp.js`, então não divergem.
//
// `connect-src` leva só a origem exata de `VITE_API_URL` — nunca curinga. Uma
// origem inválida (curinga, http fora de localhost) derruba o build.
//
// Só roda no `vite build` — no dev server o @vitejs/plugin-react injeta um script
// inline (React Refresh) que uma CSP com `script-src 'self'` bloquearia.
const cabecalhosSeguranca = (env) => {
  // A API e, com monitoramento ligado (#188), o ingest do Sentry.
  const origensConexao = [origemParaCsp(env.VITE_API_URL), origemParaCsp(env.VITE_SENTRY_DSN)];
  return {
    name: "rastria-cabecalhos-seguranca",
    apply: "build",
    transformIndexHtml: () => [
      {
        tag: "meta",
        attrs: { "http-equiv": "Content-Security-Policy", content: montarCsp({ origensConexao, paraMeta: true }) },
        injectTo: "head-prepend",
      },
    ],
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "serve.json",
        source: `${JSON.stringify(montarServeJson(montarCsp({ origensConexao })), null, 2)}\n`,
      });
    },
  };
};

// Monitoramento de erros (issue #188). A release é o commit do build — o
// Railway expõe `RAILWAY_GIT_COMMIT_SHA` — para o erro apontar a versão exata.
// Source maps só são gerados quando há credencial para enviá-los ao Sentry, e
// são apagados de dist/ logo depois do envio: nunca são servidos publicamente.
function monitoramento(env) {
  const release = env.VITE_SENTRY_RELEASE || env.RAILWAY_GIT_COMMIT_SHA || "";
  const enviaSourcemaps = Boolean(
    env.VITE_SENTRY_DSN && env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT,
  );
  return {
    release,
    sourcemap: enviaSourcemaps ? "hidden" : false,
    plugins: enviaSourcemaps
      ? [
          sentryVitePlugin({
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
            authToken: env.SENTRY_AUTH_TOKEN,
            release: { name: release || undefined },
            sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
            telemetry: false,
          }),
        ]
      : [],
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const sentry = monitoramento(env);
  return {
    plugins: [react(), cabecalhosSeguranca(env), ...sentry.plugins],
    define: { "import.meta.env.VITE_SENTRY_RELEASE": JSON.stringify(sentry.release) },
    build: { sourcemap: sentry.sourcemap },
    // Vitest + Testing Library (issue #123). `globals` para `describe`/`it`/`expect`
    // sem import em cada arquivo; `setupTests.js` traz os matchers do jest-dom e
    // limpa o DOM entre testes.
    // O Vitest transforma os arquivos de teste pelo caminho SSR, onde o
    // @vitejs/plugin-react não aplica o runtime automático de JSX — sem isto,
    // todo teste de componente falha com "React is not defined".
    esbuild: { jsx: "automatic" },
    test: {
      // `node` por default: teste de regra pura (lib/) não precisa de DOM, e
      // levantar o jsdom custa ~100s na máquina de desenvolvimento. Teste de
      // componente pede o ambiente no topo do arquivo:
      //   // @vitest-environment jsdom
      environment: "node",
      globals: true,
      setupFiles: "./src/setupTests.js",
      css: false,
      include: ["src/**/*.test.{js,jsx}", "config/**/*.test.js"],
    },
    // Defesa em profundidade para as CVEs de dev server do Vite/esbuild (issue #106):
    // manter o servidor de desenvolvimento preso ao loopback, sem expor na rede local.
    server: {
      host: "127.0.0.1",
    },
  };
});
