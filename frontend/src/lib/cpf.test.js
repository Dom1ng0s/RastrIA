import { exibirCpf, formatarCpf, mascararCpf, validarCpf } from "./cpf";

// CPF é o identificador de login (issue #13) e dado pessoal em tela (issue
// #118) — as duas pontas estão aqui.

describe("validarCpf", () => {
  it("aceita CPF válido com e sem pontuação", () => {
    expect(validarCpf("529.982.247-25")).toBe(true);
    expect(validarCpf("52998224725")).toBe(true);
  });

  it("rejeita CPF com dígito verificador errado", () => {
    // Só o último dígito muda — é exatamente o caso que uma checagem de
    // formato/tamanho deixaria passar.
    expect(validarCpf("529.982.247-24")).toBe(false);
  });

  it("rejeita sequências de dígitos repetidos", () => {
    expect(validarCpf("111.111.111-11")).toBe(false);
    expect(validarCpf("00000000000")).toBe(false);
  });

  it("rejeita tamanho errado e campo vazio", () => {
    expect(validarCpf("")).toBe(false);
    expect(validarCpf("5299822472")).toBe(false);
    expect(validarCpf("529982247250")).toBe(false);
  });
});

describe("formatarCpf", () => {
  it("pontua conforme o usuário digita", () => {
    expect(formatarCpf("529")).toBe("529");
    expect(formatarCpf("529982")).toBe("529.982");
    expect(formatarCpf("52998224725")).toBe("529.982.247-25");
  });

  it("ignora o que não for dígito e corta no 11º", () => {
    expect(formatarCpf("529abc982!247-25999")).toBe("529.982.247-25");
  });
});

describe("mascararCpf", () => {
  it("mostra só os três primeiros dígitos", () => {
    expect(mascararCpf("529.982.247-25")).toBe("529.***.***-**");
  });

  it("devolve a entrada quando não é um CPF completo", () => {
    expect(mascararCpf("529")).toBe("529");
  });
});

describe("exibirCpf", () => {
  // O default é o que protege: uma tela nova que esqueça a opção mostra
  // mascarado, não completo.
  it("mascara quando não se afirma nada", () => {
    expect(exibirCpf("52998224725")).toBe("529.***.***-**");
  });

  it("mostra completo só para o próprio dono do dado", () => {
    expect(exibirCpf("52998224725", { proprioDono: true })).toBe("529.982.247-25");
  });

  it("não imprime 'undefined' quando o dado não veio", () => {
    expect(exibirCpf(undefined)).toBe("—");
    expect(exibirCpf("")).toBe("—");
  });
});
