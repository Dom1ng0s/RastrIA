import { addDays, format } from "date-fns";
import { describe, expect, it } from "vitest";

import {
  dataExibicaoParaFormulario,
  dataFormularioParaExibicao,
  dataRegistroSchema,
} from "./dataRegistro";

const ontem = format(addDays(new Date(), -1), "dd/MM/yyyy");
const hoje = format(new Date(), "dd/MM/yyyy");
const amanha = format(addDays(new Date(), 1), "dd/MM/yyyy");

describe("dataRegistroSchema", () => {
  it("aceita data passada e o próprio dia de hoje", () => {
    expect(dataRegistroSchema.safeParse(ontem).success).toBe(true);
    expect(dataRegistroSchema.safeParse(hoje).success).toBe(true);
  });

  it("rejeita data no futuro", () => {
    // Um exame não pode ter sido feito amanhã.
    const resultado = dataRegistroSchema.safeParse(amanha);
    expect(resultado.success).toBe(false);
    expect(resultado.error.issues[0].message).toBe("A data não pode estar no futuro");
  });

  // O motivo de a validação não ser só regex: estas casam o formato mas não
  // existem no calendário.
  it.each(["31/02/2026", "29/02/2025", "00/01/2026", "01/13/2026", "32/01/2026"])(
    "rejeita %s, que casa o formato mas não existe",
    (valor) => {
      const resultado = dataRegistroSchema.safeParse(valor);
      expect(resultado.success).toBe(false);
      expect(resultado.error.issues[0].message).toBe("Data inexistente no calendário");
    },
  );

  it("aceita 29 de fevereiro em ano bissexto", () => {
    expect(dataRegistroSchema.safeParse("29/02/2024").success).toBe(true);
  });

  it.each(["", "10-08-2026", "2026-08-10", "10/8/2026", "ontem"])(
    "rejeita formato inválido: %s",
    (valor) => {
      expect(dataRegistroSchema.safeParse(valor).success).toBe(false);
    },
  );
});

describe("conversão entre data exibida e data do formulário", () => {
  it.each([
    ["10 ago 2026", "10/08/2026"],
    ["05 jan 2026", "05/01/2026"],
    ["31 dez 2025", "31/12/2025"],
    ["01 mar 2026", "01/03/2026"],
  ])("converte %s <-> %s nos dois sentidos", (exibicao, formulario) => {
    expect(dataExibicaoParaFormulario(exibicao)).toBe(formulario);
    expect(dataFormularioParaExibicao(formulario)).toBe(exibicao);
  });

  it("devolve vazio quando a data exibida não é interpretável", () => {
    expect(dataExibicaoParaFormulario("sem data")).toBe("");
    expect(dataExibicaoParaFormulario("")).toBe("");
    expect(dataExibicaoParaFormulario(undefined)).toBe("");
    expect(dataExibicaoParaFormulario(null)).toBe("");
  });

  it("preserva a entrada quando a data do formulário é inválida", () => {
    // Melhor devolver o que veio do que silenciosamente virar "Invalid Date"
    // no meio da lista.
    expect(dataFormularioParaExibicao("xx")).toBe("xx");
    expect(dataFormularioParaExibicao("31/02/2026")).toBe("31/02/2026");
  });
});
