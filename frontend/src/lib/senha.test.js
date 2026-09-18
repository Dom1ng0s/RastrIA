import { describe, expect, it } from "vitest";

import { CRITERIOS_SENHA, avaliarSenha, senhaForteSchema } from "./senha";

const FORTE = "Rastria2026!";

describe("senhaForteSchema", () => {
  it("aceita senha que cumpre os 4 requisitos", () => {
    expect(senhaForteSchema.safeParse(FORTE).success).toBe(true);
  });

  // Cada caso quebra exatamente um requisito, para garantir que a regra
  // correspondente é mesmo aplicada — e não que outra está compensando.
  it.each([
    ["curta demais", "Ab1!def", "Mínimo de 8 caracteres"],
    ["sem maiúscula", "rastria2026!", "Inclua pelo menos 1 letra maiúscula"],
    ["sem número", "RastriaSenha!", "Inclua pelo menos 1 número"],
    ["sem símbolo", "Rastria2026", "Inclua pelo menos 1 símbolo (ex: ! @ # $ %)"],
  ])("rejeita senha %s com a mensagem certa", (_caso, senha, mensagem) => {
    const resultado = senhaForteSchema.safeParse(senha);
    expect(resultado.success).toBe(false);
    expect(resultado.error.issues.map((i) => i.message)).toContain(mensagem);
  });

  it("rejeita string vazia", () => {
    expect(senhaForteSchema.safeParse("").success).toBe(false);
  });
});

describe("avaliarSenha", () => {
  it("considera forte só quando os 4 critérios passam", () => {
    const resultado = avaliarSenha(FORTE);
    expect(resultado.forte).toBe(true);
    expect(resultado.cumpridos).toBe(resultado.total);
    expect(resultado.criterios.every((c) => c.ok)).toBe(true);
  });

  it("conta os critérios parcialmente cumpridos", () => {
    // "Rastria2026" cumpre tamanho, maiúscula e número; falta símbolo.
    const resultado = avaliarSenha("Rastria2026");
    expect(resultado.cumpridos).toBe(3);
    expect(resultado.forte).toBe(false);
    expect(resultado.criterios.find((c) => c.id === "simbolo").ok).toBe(false);
  });

  it("trata senha ausente sem quebrar", () => {
    const resultado = avaliarSenha();
    expect(resultado.cumpridos).toBe(0);
    expect(resultado.forte).toBe(false);
  });

  // O schema valida o envio e os critérios alimentam o indicador visual
  // (issue #96). Se os dois divergirem, a barra fica verde numa senha que o
  // formulário vai recusar — é esse desencontro que este teste impede.
  it("concorda com o senhaForteSchema em todos os casos", () => {
    const amostras = [FORTE, "Rastria2026", "rastria2026!", "Ab1!def", "", "SENHA!2026", "aA1!aA1!"];
    for (const senha of amostras) {
      expect(avaliarSenha(senha).forte).toBe(senhaForteSchema.safeParse(senha).success);
    }
  });

  it("expõe um critério por regra, com rótulo", () => {
    expect(CRITERIOS_SENHA).toHaveLength(4);
    expect(CRITERIOS_SENHA.every((c) => c.id && c.label)).toBe(true);
  });
});
