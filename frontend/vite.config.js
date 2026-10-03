import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Content-Security-Policy de reforço, injetada como <meta> no index.html do build
// (issue #111). O header HTTP de verdade é servido pelo `serve` via
// `frontend/public/serve.json` — esta meta é só defesa em profundidade para o caso
// de o app ser aberto sem passar pelo servidor configurado. Manter as duas em sincronia.
// `frame-ancestors` é omitido aqui de propósito: navegadores ignoram essa diretiva
// quando vem de <meta>, ela só vale como header (e está no serve.json).
const CSP_META =
  "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; " +
  "img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; " +
  "connect-src 'self' https://*.railway.app";

// Só roda no `vite build` — no dev server o @vitejs/plugin-react injeta um script
// inline (React Refresh) que uma CSP com `script-src 'self'` bloquearia.
const cspMetaTag = () => ({
  name: "rastria-csp-meta-tag",
  apply: "build",
  transformIndexHtml: () => [
    {
      tag: "meta",
      attrs: { "http-equiv": "Content-Security-Policy", content: CSP_META },
      injectTo: "head-prepend",
    },
  ],
});

export default defineConfig({
  plugins: [react(), cspMetaTag()],
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
    include: ["src/**/*.test.{js,jsx}"],
  },
  // Defesa em profundidade para as CVEs de dev server do Vite/esbuild (issue #106):
  // manter o servidor de desenvolvimento preso ao loopback, sem expor na rede local.
  server: {
    host: "127.0.0.1",
  },
});
