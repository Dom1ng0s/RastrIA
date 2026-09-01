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
  // Defesa em profundidade para as CVEs de dev server do Vite/esbuild (issue #106):
  // manter o servidor de desenvolvimento preso ao loopback, sem expor na rede local.
  server: {
    host: "127.0.0.1",
  },
});
