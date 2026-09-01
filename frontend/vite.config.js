import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Defesa em profundidade para as CVEs de dev server do Vite/esbuild (issue #106):
  // manter o servidor de desenvolvimento preso ao loopback, sem expor na rede local.
  server: {
    host: "127.0.0.1",
  },
});
