// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Issue #190: access só em memória, refresh pelo cookie HttpOnly
// (withCredentials), um refresh só para vários 401 e logout no servidor.

async function carregar({ apiUrl = "https://api.exemplo.com/api" } = {}) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", apiUrl ?? "");
  const api = await import("./api");
  const tokens = await import("./authTokens");
  return { ...api, ...tokens };
}

// Adapter falso: registra cada request e responde pelo `roteador`.
function instalarAdapter(instancia, roteador, chamadas) {
  instancia.defaults.adapter = async (config) => {
    chamadas.push(config);
    const { status = 200, data = {} } = (await roteador(config)) ?? {};
    const resposta = { data, status, statusText: String(status), headers: {}, config, request: {} };
    if (status >= 400) {
      const erro = new Error(`HTTP ${status}`);
      erro.config = config;
      erro.response = resposta;
      throw erro;
    }
    return resposta;
  };
}

describe("authTokens", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("guarda o access só em memória, nada no localStorage", async () => {
    const { setAccessToken, getAccessToken, clearTokens } = await carregar();
    setAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    expect(Object.keys(localStorage)).toEqual([]);
    clearTokens();
    expect(getAccessToken()).toBeNull();
  });

  it("apaga os tokens que a #65 deixou no localStorage", async () => {
    localStorage.setItem("rastria_access_token", "velho");
    localStorage.setItem("rastria_refresh_token", "velho");
    await carregar();
    expect(localStorage.getItem("rastria_access_token")).toBeNull();
    expect(localStorage.getItem("rastria_refresh_token")).toBeNull();
  });
});

describe("api", () => {
  let chamadas;
  let assign;

  beforeEach(() => {
    chamadas = [];
    assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, pathname: "/usuario", assign });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("entrar guarda o access e manda credenciais com withCredentials", async () => {
    const { entrar, sessao, getAccessToken } = await carregar();
    instalarAdapter(sessao, () => ({ data: { access: "novo" } }), chamadas);

    await entrar({ username: "maria", password: "x" });

    expect(getAccessToken()).toBe("novo");
    expect(chamadas[0].url).toBe("/auth/token/");
    expect(chamadas[0].withCredentials).toBe(true);
  });

  it("em 401, renova pelo cookie e refaz a request com o access novo", async () => {
    const { api, sessao, setAccessToken, getAccessToken } = await carregar();
    setAccessToken("expirado");
    instalarAdapter(sessao, () => ({ data: { access: "renovado" } }), chamadas);
    instalarAdapter(
      api,
      (config) => (config.headers.Authorization === "Bearer renovado" ? { data: { ok: true } } : { status: 401 }),
      chamadas,
    );

    const resposta = await api.get("/registros-saude/");

    expect(resposta.data).toEqual({ ok: true });
    expect(getAccessToken()).toBe("renovado");
    const refresh = chamadas.find((c) => c.url === "/auth/token/refresh/");
    expect(refresh.withCredentials).toBe(true);
    expect(refresh.data).toBeUndefined(); // o refresh vai no cookie, não no corpo
  });

  it("vários 401 simultâneos fazem um refresh só", async () => {
    const { api, sessao } = await carregar();
    instalarAdapter(sessao, () => ({ data: { access: "renovado" } }), chamadas);
    instalarAdapter(
      api,
      (config) => (config.headers.Authorization === "Bearer renovado" ? { data: {} } : { status: 401 }),
      chamadas,
    );

    await Promise.all([api.get("/a/"), api.get("/b/"), api.get("/c/")]);

    expect(chamadas.filter((c) => c.url === "/auth/token/refresh/")).toHaveLength(1);
  });

  it("refresh recusado encerra a sessão e manda para o login", async () => {
    const { api, sessao, setAccessToken, getAccessToken } = await carregar();
    setAccessToken("expirado");
    instalarAdapter(sessao, () => ({ status: 401 }), chamadas);
    instalarAdapter(api, () => ({ status: 401 }), chamadas);

    await expect(api.get("/x/")).rejects.toThrow("HTTP 401");
    expect(getAccessToken()).toBeNull();
    expect(assign).toHaveBeenCalledWith("/login");
  });

  it("sair avisa o servidor quando há API configurada", async () => {
    const { sair, sessao, setAccessToken, getAccessToken } = await carregar();
    setAccessToken("abc");
    instalarAdapter(sessao, () => ({ status: 204 }), chamadas);

    await sair();

    expect(getAccessToken()).toBeNull();
    expect(chamadas.map((c) => c.url)).toEqual(["/auth/logout/"]);
    expect(chamadas[0].withCredentials).toBe(true);
  });

  it("sair não lança com a rede fora", async () => {
    const { sair, sessao } = await carregar();
    instalarAdapter(sessao, () => ({ status: 503 }), chamadas);
    await expect(sair()).resolves.toBeUndefined();
  });

  it("sem API configurada (MVP mockado), sair não chama rede nenhuma", async () => {
    const { sair, sessao, API_CONFIGURADA } = await carregar({ apiUrl: null });
    instalarAdapter(sessao, () => ({ status: 204 }), chamadas);
    await sair();
    expect(API_CONFIGURADA).toBe(false);
    expect(chamadas).toEqual([]);
  });
});
