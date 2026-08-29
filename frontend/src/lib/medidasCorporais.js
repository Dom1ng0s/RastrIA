import { z } from "zod";

/**
 * Faixas de sanidade para peso e altura informados pelo usuário (telas de
 * Onboarding e Perfil). `z.coerce.number().positive()` sozinho aceitava
 * 0.1 kg, 3 cm ou 99999, e "1.70" digitado no campo de altura virava 1.7 cm —
 * tudo isso entrava no cálculo automático de IMC. Fonte única de verdade,
 * reaproveitada entre as duas telas (ver issue #41).
 */
export const PESO_KG_MIN = 25;
export const PESO_KG_MAX = 300;
export const ALTURA_CM_MIN = 100;
export const ALTURA_CM_MAX = 250;

function medidaSchema({ min, max, unidade, exemplo }) {
  const faixa = `um valor entre ${min} e ${max} ${unidade} (ex: ${exemplo})`;
  return z.preprocess(
    // Campo vazio coage para NaN e cai no `invalid_type_error`, não numa
    // mensagem de faixa confusa.
    (valor) => (typeof valor === "string" && valor.trim() === "" ? undefined : valor),
    z.coerce
      .number({ invalid_type_error: "Informe um número" })
      .min(min, `Use ${faixa}`)
      .max(max, `Use ${faixa}`),
  );
}

export const pesoKgSchema = medidaSchema({ min: PESO_KG_MIN, max: PESO_KG_MAX, unidade: "kg", exemplo: 70 });
export const alturaCmSchema = medidaSchema({
  min: ALTURA_CM_MIN,
  max: ALTURA_CM_MAX,
  unidade: "cm",
  exemplo: 170,
});

export const medidasCorporaisSchema = z.object({
  pesoKg: pesoKgSchema,
  alturaCm: alturaCmSchema,
});
