import { differenceInYears, format, parseISO } from "date-fns";

// `new Date("1996-03-15")` é interpretado como meia-noite UTC e renderizado em
// horário local (UTC-3), caindo no dia anterior. `parseISO` do date-fns trata
// string só-data como meia-noite LOCAL, evitando o deslocamento de fuso.
// A data de nascimento vem da planilha de integrantes (formato "aaaa-mm-dd").

export function parseDataNascimento(dataIso) {
  return parseISO(dataIso);
}

export function formatarDataNascimento(dataIso) {
  return format(parseDataNascimento(dataIso), "dd/MM/yyyy");
}

export function calcularIdade(dataIso) {
  return differenceInYears(new Date(), parseDataNascimento(dataIso));
}
