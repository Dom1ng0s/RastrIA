import {
  ALTURA_CM_MAX,
  ALTURA_CM_MIN,
  PESO_KG_MAX,
  PESO_KG_MIN,
  alturaCmSchema,
  medidasCorporaisSchema,
  pesoKgSchema,
} from "./medidasCorporais";

// Faixas de sanidade de peso e altura (issue #41). O que motivou: "1.70"
// digitado no campo de altura virava 1,7 cm e entrava no cálculo de IMC.

describe("pesoKgSchema", () => {
  it("aceita os extremos da faixa", () => {
    expect(pesoKgSchema.safeParse(PESO_KG_MIN).success).toBe(true);
    expect(pesoKgSchema.safeParse(PESO_KG_MAX).success).toBe(true);
  });

  it("aceita número vindo como string do input", () => {
    expect(pesoKgSchema.safeParse("70.5").success).toBe(true);
  });

  it("rejeita fora da faixa", () => {
    expect(pesoKgSchema.safeParse(PESO_KG_MIN - 1).success).toBe(false);
    expect(pesoKgSchema.safeParse(PESO_KG_MAX + 1).success).toBe(false);
    expect(pesoKgSchema.safeParse(0.1).success).toBe(false);
  });
});

describe("alturaCmSchema", () => {
  it("aceita os extremos da faixa", () => {
    expect(alturaCmSchema.safeParse(ALTURA_CM_MIN).success).toBe(true);
    expect(alturaCmSchema.safeParse(ALTURA_CM_MAX).success).toBe(true);
  });

  it("rejeita altura digitada em metros", () => {
    // O caso real: "1.70" no campo de cm.
    expect(alturaCmSchema.safeParse("1.70").success).toBe(false);
  });

  it("rejeita valor absurdo", () => {
    expect(alturaCmSchema.safeParse(99999).success).toBe(false);
  });
});

describe("campo vazio e lixo", () => {
  it("pede um número em vez de reclamar da faixa", () => {
    const resultado = pesoKgSchema.safeParse("");
    expect(resultado.success).toBe(false);
    expect(resultado.error.issues[0].message).toBe("Informe um número");
  });

  it("rejeita texto", () => {
    expect(pesoKgSchema.safeParse("setenta").success).toBe(false);
  });
});

describe("medidasCorporaisSchema", () => {
  it("valida os dois campos juntos", () => {
    expect(medidasCorporaisSchema.safeParse({ pesoKg: 70, alturaCm: 170 }).success).toBe(true);
    expect(medidasCorporaisSchema.safeParse({ pesoKg: 70, alturaCm: 1.7 }).success).toBe(false);
  });
});
