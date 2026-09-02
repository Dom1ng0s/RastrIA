import { isValid, parse } from "date-fns";

import { validarCpf } from "../../lib/cpf";
import { parseCsv } from "../../lib/parseCsv";

// Ver nota completa em lib/parseCsv.js sobre por que .xlsx não é
// efetivamente parseado ainda (vulnerabilidade sem correção na versão npm
// pública da lib xlsx/SheetJS).
export const ARQUIVO_ACEITA_XLSX_SEM_PARSER = true;

// Colunas finais decididas em 25/08/2026 (ver agents/claude.md, "Dados
// pessoais complementares"): nome completo, CPF, data de nascimento, sexo,
// telefone (ou e-mail institucional — a confirmar com a PMAL). Aceita
// variações comuns de cabeçalho (com/sem acento, singular/abreviado).
const ALIASES_COLUNA = {
  nomeCompleto: ["nome completo", "nome"],
  cpf: ["cpf"],
  dataNascimento: ["data de nascimento", "data nascimento", "nascimento"],
  sexo: ["sexo"],
  contato: ["telefone", "e-mail institucional", "email institucional", "email", "e-mail"],
};

function normalizarCabecalho(valor) {
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function localizarColunas(linhaCabecalho) {
  const cabecalhosNormalizados = linhaCabecalho.map(normalizarCabecalho);
  const indices = {};
  for (const [chave, aliases] of Object.entries(ALIASES_COLUNA)) {
    const aliasesNormalizados = aliases.map(normalizarCabecalho);
    indices[chave] = cabecalhosNormalizados.findIndex((cabecalho) => aliasesNormalizados.includes(cabecalho));
  }
  return indices;
}

const SEXOS_VALIDOS = { m: "M", masculino: "M", f: "F", feminino: "F" };
const CONTATO_TELEFONE_REGEX = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
const CONTATO_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarLinha(campos, indices) {
  const erros = [];

  const nomeCompleto = (campos[indices.nomeCompleto] ?? "").trim();
  if (!nomeCompleto) erros.push("Nome completo em branco");

  const cpfBruto = (campos[indices.cpf] ?? "").trim();
  if (!cpfBruto) erros.push("CPF em branco");
  else if (!validarCpf(cpfBruto)) erros.push("CPF inválido");

  const dataNascimentoBruta = (campos[indices.dataNascimento] ?? "").trim();
  let dataNascimentoValida = false;
  if (!dataNascimentoBruta) {
    erros.push("Data de nascimento em branco");
  } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataNascimentoBruta)) {
    erros.push("Data de nascimento fora do formato dd/mm/aaaa");
  } else {
    const data = parse(dataNascimentoBruta, "dd/MM/yyyy", new Date());
    if (!isValid(data) || data > new Date()) {
      erros.push("Data de nascimento inválida");
    } else {
      dataNascimentoValida = true;
    }
  }

  const sexoBruto = (campos[indices.sexo] ?? "").trim().toLowerCase();
  const sexo = SEXOS_VALIDOS[sexoBruto];
  if (!sexoBruto) erros.push("Sexo em branco");
  else if (!sexo) erros.push('Sexo deve ser "M" ou "F"');

  const contato = (campos[indices.contato] ?? "").trim();
  if (!contato) erros.push("Telefone ou e-mail em branco");
  else if (!CONTATO_TELEFONE_REGEX.test(contato) && !CONTATO_EMAIL_REGEX.test(contato)) {
    erros.push("Telefone ou e-mail em formato inválido");
  }

  return {
    nomeCompleto,
    cpf: cpfBruto,
    dataNascimento: dataNascimentoValida ? dataNascimentoBruta : dataNascimentoBruta,
    sexo: sexo ?? sexoBruto,
    contato,
    erros,
  };
}

/**
 * Processa o texto de um .csv de integrantes e devolve a prévia (issue #17):
 * cabeçalhos não reconhecidos, e uma linha por integrante com os erros de
 * validação encontrados (array vazio = linha válida, pronta para importar).
 * Não faz nenhuma chamada de rede — é só leitura/validação local do arquivo.
 */
export function processarPlanilhaIntegrantes(textoCsv) {
  const linhas = parseCsv(textoCsv);
  if (linhas.length === 0) {
    return { colunasFaltando: Object.keys(ALIASES_COLUNA), registros: [] };
  }

  const [cabecalho, ...linhasDeDados] = linhas;
  const indices = localizarColunas(cabecalho);
  const colunasFaltando = Object.entries(indices)
    .filter(([, indice]) => indice === -1)
    .map(([chave]) => chave);

  if (colunasFaltando.length > 0) {
    return { colunasFaltando, registros: [] };
  }

  const registros = linhasDeDados.map((campos, indice) => ({
    linha: indice + 2, // +1 pelo cabeçalho, +1 porque planilhas começam em 1
    ...validarLinha(campos, indices),
  }));

  return { colunasFaltando: [], registros };
}
