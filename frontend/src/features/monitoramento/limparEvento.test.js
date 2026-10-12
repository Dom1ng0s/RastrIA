import { limparBreadcrumb, limparEvento, mascararTexto, urlSemParametros } from "./limparEvento";

// Issue #188: nenhum CPF, e-mail, corpo de requisição, query string, cookie ou
// usuário sai do navegador junto com um erro.

describe("mascararTexto", () => {
  it("mascara CPF com e sem pontuação, e e-mail", () => {
    expect(mascararTexto("CPF 529.982.247-25 inválido")).toBe("CPF [cpf] inválido");
    expect(mascararTexto("cpf=52998224725")).toBe("cpf=[cpf]");
    expect(mascararTexto("contato maria@pm.al.gov.br")).toBe("contato [email]");
  });
});

describe("urlSemParametros", () => {
  it("tira query string e fragmento", () => {
    expect(urlSemParametros("https://app/primeiro-acesso/abc?cpf=1#x")).toBe("https://app/primeiro-acesso/abc");
  });
});

describe("limparEvento", () => {
  const evento = {
    message: "Falha ao salvar 529.982.247-25",
    user: { id: 1, email: "maria@pm.al.gov.br", ip_address: "1.2.3.4" },
    extra: { registro: { valor: 180 } },
    request: {
      url: "https://rastria.up.railway.app/usuario?busca=maria",
      query_string: "busca=maria",
      data: { valor: 180 },
      cookies: { sessao: "x" },
      headers: { Authorization: "Bearer abc" },
    },
    exception: { values: [{ type: "Error", value: "CPF 52998224725 não encontrado", stacktrace: { frames: [] } }] },
    breadcrumbs: [
      { category: "ui.click", message: "button#salvar" },
      { category: "ui.input", message: "input#cpf" },
      { category: "console", message: "dados 529.982.247-25" },
      { category: "navigation", data: { from: "/login?x=1", to: "/usuario?y=2" } },
      { category: "xhr", data: { url: "https://api/x?cpf=1", method: "POST", status_code: 500, request_body: "{}" } },
    ],
  };

  const limpo = limparEvento(evento);

  it("remove usuário, extras e tudo da requisição menos a URL sem query", () => {
    expect(limpo.user).toBeUndefined();
    expect(limpo.extra).toBeUndefined();
    expect(limpo.request).toEqual({ url: "https://rastria.up.railway.app/usuario" });
  });

  it("mascara CPF na mensagem e na exceção, mantendo a pilha", () => {
    expect(limpo.message).toBe("Falha ao salvar [cpf]");
    expect(limpo.exception.values[0].value).toBe("CPF [cpf] não encontrado");
    expect(limpo.exception.values[0].stacktrace).toEqual({ frames: [] });
  });

  it("descarta breadcrumbs de interface e console; limpa navegação e rede", () => {
    expect(limpo.breadcrumbs).toEqual([
      { category: "navigation", message: undefined, data: { from: "/login", to: "/usuario" } },
      { category: "xhr", message: undefined, data: { url: "https://api/x", method: "POST", status_code: 500 } },
    ]);
  });

  it("não altera o evento original", () => {
    expect(evento.user).toBeDefined();
  });

  it("breadcrumb isolado de interface é descartado", () => {
    expect(limparBreadcrumb({ category: "ui.click", message: "x" })).toBeNull();
  });
});
