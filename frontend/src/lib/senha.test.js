import { avaliarSenha, senhaForteSchema } from "./senha";

// Regra de senha das contas provisionadas (issue #13): 8 caracteres, 1
// maiúscula, 1 número, 1 símbolo. `senhaForteSchema` valida o envio e
// `avaliarSenha` alimenta o indicador em tempo real — os dois têm que
// concordar, e é isso que o último teste trava.

describe("senhaForteSchema", () => {
  it("aceita uma senha que cumpre os quatro requisitos", () => {
    expect(senhaForteSchema.safeParse("Abc12345!").success).toBe(true);
  });

  it.each([
    ["Ab1!xy", "Mínimo de 8 caracteres"],
    ["abc12345!", "Inclua pelo menos 1 letra maiúscula"],
    ["Abcdefg!", "Inclua pelo menos 1 número"],
    ["Abc12345", "Inclua pelo menos 1 símbolo (ex: ! @ # $ %)"],
  ])("rejeita %s com a mensagem do requisito que falta", (senha, mensagem) => {
    const resultado = senhaForteSchema.safeParse(senha);
    expect(resultado.success).toBe(false);
    expect(resultado.error.issues.map((i) => i.message)).toContain(mensagem);
  });

  it("aceita acentos e espaços como parte da senha", () => {
    expect(senhaForteSchema.safeParse("Senha Forte 1!").success).toBe(true);
  });
});

describe("avaliarSenha", () => {
  it("não quebra sem argumento (campo ainda vazio)", () => {
    const { cumpridos, forte, criterios } = avaliarSenha();
    expect(cumpridos).toBe(0);
    expect(forte).toBe(false);
    expect(criterios.every((c) => c.ok === false)).toBe(true);
  });

  it("conta só os critérios cumpridos", () => {
    const { cumpridos, total, forte } = avaliarSenha("Abc12345");
    expect(cumpridos).toBe(3);
    expect(total).toBe(4);
    expect(forte).toBe(false);
  });

  it("marca como forte quando todos são cumpridos", () => {
    expect(avaliarSenha("Abc12345!").forte).toBe(true);
  });

  // As duas regras vivem em lugares diferentes do arquivo e já divergiram em
  // outros pontos do projeto; aqui a divergência falha o teste.
  it("concorda com o senhaForteSchema em qualquer senha", () => {
    const amostras = ["", "abc", "Abc12345", "abc12345!", "Abcdefg!", "Abc12345!", "Senha Forte 1!"];
    amostras.forEach((senha) => {
      expect(avaliarSenha(senha).forte).toBe(senhaForteSchema.safeParse(senha).success);
    });
  });
});
