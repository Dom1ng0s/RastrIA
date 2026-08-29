import { isFuture, isValid, parse, startOfDay } from "date-fns";
import { z } from "zod";

/**
 * Validação da data digitada nos formulários de cadastro (exame, exercício
 * físico, TAF). O formato `dd/mm/aaaa` sozinho não basta: `31/02/2099` casa a
 * regex mas não existe no calendário e ainda está no futuro. Fonte única de
 * verdade, reaproveitada entre os três formulários (ver issue #37).
 */
const FORMATO = /^\d{2}\/\d{2}\/\d{4}$/;

export function parseDataRegistro(valor) {
  // `parse` do date-fns valida o dia contra o mês/ano (rejeita 31/02, 29/02 em
  // ano não bissexto, dia 00, mês 13...) devolvendo Invalid Date nesses casos.
  return parse(valor, "dd/MM/yyyy", new Date());
}

export const dataRegistroSchema = z
  .string()
  .min(1, "Informe a data")
  .regex(FORMATO, "Use o formato dd/mm/aaaa")
  .refine((valor) => isValid(parseDataRegistro(valor)), "Data inexistente no calendário")
  .refine(
    (valor) => !isFuture(startOfDay(parseDataRegistro(valor))),
    "A data não pode estar no futuro",
  );
