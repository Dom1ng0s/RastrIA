import { describe, expect, it } from "vitest";

import { rotaInternaSegura } from "./rotaInterna";

// Defesa em profundidade contra open redirect (issue #107 /
// GHSA-wrjc-x8rr-h8h6). O `from` guardado antes do login e, desde a issue
// #129, o `destino` de uma notificação passam por aqui — este último vira dado
// vindo do backend quando a #31 existir.
describe("rotaInternaSegura", () => {
  it.each(["/usuario", "/gerente/unidade/1", "/usuario/ranking?aba=1", "/usuario#ultimo-taf", "/"])(
    "aceita a rota interna %s",
    (caminho) => {
      expect(rotaInternaSegura(caminho)).toBe(caminho);
    },
  );

  it.each([
    ["URL absoluta", "https://evil.com"],
    ["protocol-relative", "//evil.com"],
    ["barra invertida", "/\\evil.com"],
    ["tab antes do host", "/\tevil.com"],
    ["espaço antes do host", "/ evil.com"],
    ["javascript:", "/javascript:alert(1)"],
    ["esquema no 1º segmento", "/x:y"],
    ["caminho relativo", "usuario"],
    ["string vazia", ""],
  ])("joga %s no fallback", (_caso, caminho) => {
    expect(rotaInternaSegura(caminho, "/")).toBe("/");
  });

  it("rejeita valor que não é string", () => {
    expect(rotaInternaSegura(null, "/")).toBe("/");
    expect(rotaInternaSegura(undefined, "/")).toBe("/");
    expect(rotaInternaSegura({ toString: () => "/usuario" }, "/")).toBe("/");
  });

  it("usa o fallback informado, não um fixo", () => {
    expect(rotaInternaSegura("https://evil.com", "/login")).toBe("/login");
  });

  it("nunca devolve algo que o navegador resolveria para fora do app", () => {
    const hostis = ["//evil.com", "/\\evil.com", "https://evil.com", "/\tevil.com", "/\revil.com"];
    for (const caminho of hostis) {
      const resultado = rotaInternaSegura(caminho, "/");
      expect(resultado).toBe("/");
      expect(resultado).not.toContain("evil.com");
    }
  });
});
