import { format, isFuture, isValid, parse, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
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

// --- Conversão entre o formato digitado e o exibido --------------------------
//
// A lista mostra "10 ago 2026" e o formulário usa "dd/mm/aaaa". Editar um
// registro (issue #130) precisa dos dois sentidos: preencher o formulário a
// partir do que está na lista e devolver o valor para a lista ao salvar.
//
// Enquanto é mock, a data trafega como string já formatada. Quando o backend
// existir ela vem em ISO, e só estas duas funções mudam.

const FORMATO_EXIBICAO = "dd MMM yyyy";

/** "10 ago 2026" -> "10/08/2026" (string vazia se não der para interpretar). */
export function dataExibicaoParaFormulario(exibicao) {
  if (typeof exibicao !== "string") return "";
  const data = parse(exibicao, FORMATO_EXIBICAO, new Date(), { locale: ptBR });
  return isValid(data) ? format(data, "dd/MM/yyyy") : "";
}

/** "10/08/2026" -> "10 ago 2026" (devolve a entrada se não for data válida). */
export function dataFormularioParaExibicao(valor) {
  const data = parseDataRegistro(valor);
  return isValid(data) ? format(data, FORMATO_EXIBICAO, { locale: ptBR }) : valor;
}
