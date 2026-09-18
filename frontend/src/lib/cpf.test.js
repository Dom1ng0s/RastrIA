import { describe, expect, it } from "vitest";

import { formatarCpf, mascararCpf, validarCpf } from "./cpf";

// CPFs válidos de teste, com dígito verificador correto (gerados para o teste,
// não pertencem a ninguém).
const VALIDOS = ["529.982.247-25", "111.444.777-35", "52998224725"];

describe("validarCpf", () => {
  it.each(VALIDOS)("aceita %s", (cpf) => {
    expect(validarCpf(cpf)).toBe(true);
  });

  it("rejeita CPF com dígito verificador errado", () => {
    // Mesmos 9 primeiros dígitos de um válido, verificadores trocados — é o
    // caso que uma checagem de formato/tamanho deixaria passar.
    expect(validarCpf("529.982.247-26")).toBe(false);
    expect(validarCpf("111.444.777-36")).toBe(false);
  });

  it("rejeita sequências de dígitos repetidos", () => {
    // 111.111.111-11 e afins passam no cálculo do dígito verificador, então
    // precisam ser barrados à parte.
    for (let digito = 0; digito <= 9; digito += 1) {
      expect(validarCpf(String(digito).repeat(11))).toBe(false);
    }
  });

  it("rejeita quantidade de dígitos diferente de 11", () => {
    expect(validarCpf("")).toBe(false);
    expect(validarCpf("529982247")).toBe(false);
    expect(validarCpf("5299822472555")).toBe(false);
  });

  it("ignora pontuação ao validar", () => {
    expect(validarCpf("529.982.247-25")).toBe(validarCpf("52998224725"));
  });
});

describe("formatarCpf", () => {
  it("aplica a máscara progressivamente enquanto digita", () => {
    expect(formatarCpf("529")).toBe("529");
    expect(formatarCpf("5299")).toBe("529.9");
    expect(formatarCpf("529982")).toBe("529.982");
    expect(formatarCpf("529982247")).toBe("529.982.247");
    expect(formatarCpf("52998224725")).toBe("529.982.247-25");
  });

  it("descarta caracteres não numéricos e o excedente de 11 dígitos", () => {
    expect(formatarCpf("529a982b247c25")).toBe("529.982.247-25");
    expect(formatarCpf("5299822472599999")).toBe("529.982.247-25");
  });
});

describe("mascararCpf", () => {
  // Regra de design: CPF nunca aparece completo para quem não é o dono
  // (ver agents/claude.md).
  it("expõe só os 3 primeiros dígitos", () => {
    expect(mascararCpf("529.982.247-25")).toBe("529.***.***-**");
    expect(mascararCpf("52998224725")).toBe("529.***.***-**");
  });

  it("não vaza nenhum dos 8 últimos dígitos", () => {
    const mascarado = mascararCpf("52998224725");
    expect(mascarado).not.toContain("982");
    expect(mascarado).not.toContain("247");
    expect(mascarado).not.toContain("25");
  });

  it("devolve a entrada intacta quando não tem 11 dígitos", () => {
    expect(mascararCpf("529982")).toBe("529982");
    expect(mascararCpf("")).toBe("");
  });
});
