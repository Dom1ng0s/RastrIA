/**
 * Parser de CSV mínimo, sem dependência externa (issue #17 — upload de
 * planilha de integrantes). Suporta campos entre aspas (com vírgula, quebra
 * de linha ou aspas escapadas `""` dentro do valor) e as duas quebras de
 * linha comuns (`\n`, `\r\n`). Devolve um array de linhas, cada linha um
 * array de campos (strings, já sem as aspas delimitadoras).
 *
 * Deliberadamente não usamos a lib `xlsx` (SheetJS) aqui: a versão
 * disponível no registro público do npm (0.18.5) tem duas vulnerabilidades
 * conhecidas sem correção publicada nesse registro (prototype pollution e
 * ReDoS — GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9). Por isso o upload aceita
 * .xlsx no seletor de arquivo, mas só .csv é de fato processado por
 * enquanto — ver `ARQUIVO_ACEITA_XLSX_SEM_PARSER` em
 * features/importarIntegrantes/planilha.js.
 */
export function parseCsv(texto) {
  const linhas = [];
  let linhaAtual = [];
  let campoAtual = "";
  let dentroDeAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];

    if (dentroDeAspas) {
      if (char === '"') {
        if (texto[i + 1] === '"') {
          campoAtual += '"';
          i++;
        } else {
          dentroDeAspas = false;
        }
      } else {
        campoAtual += char;
      }
      continue;
    }

    if (char === '"') {
      dentroDeAspas = true;
    } else if (char === ",") {
      linhaAtual.push(campoAtual);
      campoAtual = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && texto[i + 1] === "\n") i++;
      linhaAtual.push(campoAtual);
      linhas.push(linhaAtual);
      linhaAtual = [];
      campoAtual = "";
    } else {
      campoAtual += char;
    }
  }

  if (campoAtual !== "" || linhaAtual.length > 0) {
    linhaAtual.push(campoAtual);
    linhas.push(linhaAtual);
  }

  // Remove linhas totalmente vazias (comum como última linha do arquivo).
  return linhas.filter((linha) => linha.some((campo) => campo.trim() !== ""));
}
