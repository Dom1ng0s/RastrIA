import { describe, expect, it } from "vitest";

import { escaparCelulaCsv, gerarCsvHistorico } from "./exportarHistorico";

// Excel e Google Sheets tratam célula começando com = + - @ (ou TAB/CR) como
// fórmula. O histórico exportado carrega texto que veio do usuário, então sem
// neutralização o CSV vira vetor de execução ao ser aberto.
describe("escaparCelulaCsv — neutralização de CSV injection", () => {
  it.each([
    ["=", '=1+1'],
    ["+", "+1+1"],
    ["-", "-1+1"],
    ["@", "@SUM(A1)"],
    ["TAB", "\t=1+1"],
    ["CR", "\r=1+1"],
  ])("prefixa com aspa simples célula iniciada por %s", (_nome, valor) => {
    const resultado = escaparCelulaCsv(valor);
    expect(resultado).toBe(`"'${valor}"`);
    // O conteúdo perigoso deixa de estar na primeira posição da célula.
    expect(resultado.startsWith(`"'`)).toBe(true);
  });

  it("neutraliza o payload clássico de execução de comando", () => {
    const ataque = '=cmd|\'/c calc\'!A1';
    const resultado = escaparCelulaCsv(ataque);
    expect(resultado).toBe(`"'=cmd|'/c calc'!A1"`);
  });

  it("não prefixa texto comum", () => {
    expect(escaparCelulaCsv("Glicemia em jejum")).toBe('"Glicemia em jejum"');
    expect(escaparCelulaCsv("112 mg/dL")).toBe('"112 mg/dL"');
  });

  it("dobra aspas duplas internas para não encerrar a célula", () => {
    expect(escaparCelulaCsv('valor "alterado"')).toBe('"valor ""alterado"""');
  });

  it("envolve em aspas para conter vírgula e quebra de linha", () => {
    expect(escaparCelulaCsv("a,b")).toBe('"a,b"');
    expect(escaparCelulaCsv("linha1\nlinha2")).toBe('"linha1\nlinha2"');
  });

  it("trata null e undefined como célula vazia", () => {
    expect(escaparCelulaCsv(null)).toBe('""');
    expect(escaparCelulaCsv(undefined)).toBe('""');
  });
});

describe("gerarCsvHistorico", () => {
  const dados = {
    secoes: [
      { titulo: "Exames", colunas: ["Índice", "Valor"], linhas: [["Glicemia", "112 mg/dL"]] },
    ],
  };

  it("começa com BOM para o Excel reconhecer UTF-8", () => {
    expect(gerarCsvHistorico(dados).charCodeAt(0)).toBe(0xfeff);
  });

  it("usa CRLF entre linhas, conforme RFC 4180", () => {
    expect(gerarCsvHistorico(dados)).toContain("\r\n");
  });

  it("escapa todas as células, inclusive as vindas de dados do usuário", () => {
    const csv = gerarCsvHistorico({
      secoes: [{ titulo: "Exames", colunas: ["Índice"], linhas: [["=HYPERLINK(\"http://x\")"]] }],
    });
    expect(csv).toContain(`"'=HYPERLINK`);
  });

  it("separa seções com uma linha em branco", () => {
    const csv = gerarCsvHistorico({
      secoes: [
        { titulo: "A", colunas: ["c"], linhas: [] },
        { titulo: "B", colunas: ["c"], linhas: [] },
      ],
    });
    expect(csv).toContain('"A"\r\n"c"\r\n\r\n"B"');
  });
});
