// Setup dos testes (issue #123) — carregado antes de cada arquivo de teste
// (ver `test.setupFiles` em vite.config.js).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// O jsdom não implementa matchMedia, e o app consulta
// `prefers-reduced-motion` (rolagem até seção em DashboardLayout, issue #129).
// Stub que responde "não" para qualquer consulta — o comportamento reduzido é
// testado passando a preferência explicitamente onde importa.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// Sem isto o DOM de um teste vaza para o próximo e as buscas do Testing
// Library passam a encontrar elementos duplicados.
afterEach(cleanup);
