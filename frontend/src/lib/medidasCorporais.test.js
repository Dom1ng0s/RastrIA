import { describe, expect, it } from "vitest";

import {
  ALTURA_CM_MAX,
  ALTURA_CM_MIN,
  PESO_KG_MAX,
  PESO_KG_MIN,
  alturaCmSchema,
  medidasCorporaisSchema,
  pesoKgSchema,
} from "./medidasCorporais";

describe("pesoKgSchema", () => {
  it("aceita valores dentro da faixa, inclusive os limites", () => {
    expect(pesoKgSchema.safeParse(70).success).toBe(true);
    expect(pesoKgSchema.safeParse(PESO_KG_MIN).success).toBe(true);
    expect(pesoKgSchema.safeParse(PESO_KG_MAX).success).toBe(true);
  });

  // Os casos que motivaram a issue #41: `positive()` sozinho aceitava tudo
  // isso, e ia direto para o cálculo de IMC.
  it.each([0.1, 3, 24, 301, 99999, -70])("rejeita %s kg, fora da faixa plausível", (valor) => {
    expect(pesoKgSchema.safeParse(valor).success).toBe(false);
  });

  it("aceita número digitado como texto", () => {
    expect(pesoKgSchema.safeParse("70").success).toBe(true);
    expect(pesoKgSchema.safeParse("70.5").success).toBe(true);
  });

  it("dá mensagem de tipo, não de faixa, quando o campo vem vazio", () => {
    // Campo vazio virava NaN e caía numa mensagem de faixa confusa
    // ("use um valor entre 25 e 300") em vez de "informe um número".
    const resultado = pesoKgSchema.safeParse("");
    expect(resultado.success).toBe(false);
    expect(resultado.error.issues[0].message).toBe("Informe um número");
    expect(pesoKgSchema.safeParse("   ").error.issues[0].message).toBe("Informe um número");
  });

  it("rejeita texto que não é número", () => {
    expect(pesoKgSchema.safeParse("setenta").success).toBe(false);
  });
});

describe("alturaCmSchema", () => {
  it("aceita altura em centímetros dentro da faixa", () => {
    expect(alturaCmSchema.safeParse(170).success).toBe(true);
    expect(alturaCmSchema.safeParse(ALTURA_CM_MIN).success).toBe(true);
    expect(alturaCmSchema.safeParse(ALTURA_CM_MAX).success).toBe(true);
  });

  it("rejeita altura digitada em metros", () => {
    // "1.70" no campo de centímetros viraria 1,7 cm — o caso concreto da #41.
    expect(alturaCmSchema.safeParse("1.70").success).toBe(false);
    expect(alturaCmSchema.safeParse(1.7).success).toBe(false);
  });

  it.each([3, 99, 251, 10000])("rejeita %s cm, fora da faixa plausível", (valor) => {
    expect(alturaCmSchema.safeParse(valor).success).toBe(false);
  });
});

describe("medidasCorporaisSchema", () => {
  it("aceita o par completo e válido", () => {
    expect(medidasCorporaisSchema.safeParse({ pesoKg: 70, alturaCm: 170 }).success).toBe(true);
  });

  it("falha se qualquer um dos dois estiver fora da faixa", () => {
    expect(medidasCorporaisSchema.safeParse({ pesoKg: 70, alturaCm: 1.7 }).success).toBe(false);
    expect(medidasCorporaisSchema.safeParse({ pesoKg: 0.5, alturaCm: 170 }).success).toBe(false);
  });
});
