// Roda para todo arquivo de teste; o que depende de DOM só é aplicado quando o
// arquivo pediu `// @vitest-environment jsdom`.
import { afterEach } from "vitest";

const temDom = typeof window !== "undefined";

if (temDom) {
  await import("@testing-library/jest-dom/vitest");
  const { cleanup } = await import("@testing-library/react");
  // Testing Library não desmonta sozinha com `globals: true`; sem isto um teste
  // enxerga o DOM do anterior e a falha aparece no teste errado.
  afterEach(cleanup);
}

// `features/acessibilidade/store.js` aplica as classes no <html> assim que é
// importado e lê localStorage; o jsdom já oferece os dois. O que falta é
// matchMedia, que o store consulta para herdar a preferência do sistema.
if (temDom && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
