import { montarCsp, montarServeJson, origemParaCsp } from "./csp";

// Issue #192: a CSP sai de um template só e nunca leva curinga de host.

describe("origemParaCsp", () => {
  it("reduz a URL da API à origem", () => {
    expect(origemParaCsp("https://api-rastria.up.railway.app/api")).toBe("https://api-rastria.up.railway.app");
    expect(origemParaCsp("http://localhost:8000/api")).toBe("http://localhost:8000");
  });

  it("devolve null quando não há URL", () => {
    expect(origemParaCsp(undefined)).toBeNull();
    expect(origemParaCsp("  ")).toBeNull();
  });

  it.each(["https://*.railway.app", "*", "http://api.exemplo.com", "ftp://x.com", "/api", "api.exemplo.com"])(
    "recusa %s",
    (url) => {
      expect(() => origemParaCsp(url)).toThrow(/CSP/);
    },
  );
});

describe("montarCsp", () => {
  const csp = montarCsp({ origensConexao: ["https://api-rastria.up.railway.app"] });

  it("libera conexão só para a própria origem e a da API", () => {
    expect(csp).toContain("connect-src 'self' https://api-rastria.up.railway.app");
    expect(csp).not.toContain("railway.app;");
    expect(csp).not.toMatch(/\*/);
  });

  it("sem API configurada, conecta só na própria origem", () => {
    expect(montarCsp()).toMatch(/connect-src 'self'$/);
  });

  it("mantém frame-ancestors no header e tira da <meta> (o navegador ignora lá)", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(montarCsp({ paraMeta: true })).not.toContain("frame-ancestors");
  });

  it("derruba origem com curinga mesmo se ela escapar da validação de URL", () => {
    expect(() => montarCsp({ origensConexao: ["https://*.railway.app"] })).toThrow(/curinga/);
  });
});

describe("montarServeJson", () => {
  it("leva a CSP gerada e os demais headers de segurança", () => {
    const headers = montarServeJson("default-src 'self'").headers[0].headers;
    const chaves = headers.map((h) => h.key);
    expect(chaves).toEqual([
      "Content-Security-Policy",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Strict-Transport-Security",
    ]);
    expect(headers[0].value).toBe("default-src 'self'");
  });
});
