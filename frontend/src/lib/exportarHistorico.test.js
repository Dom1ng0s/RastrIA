import { escaparCelulaCsv, gerarCsvHistorico } from "./exportarHistorico";

// Neutralização de CSV injection: uma célula que começa com = + - @ é fórmula
// para Excel/LibreOffice/Sheets. O histórico exportado carrega texto vindo de
// campo preenchido por gente, então o conteúdo não é confiável.

describe("escaparCelulaCsv", () => {
  it.each(["=1+1", '=HYPERLINK("http://x","clique")', "+1", "-1", "@SUM(A1)", "\tx", "\rx"])(
    "prefixa aspas simples em %j, que a planilha interpretaria como fórmula",
    (valor) => {
      expect(escaparCelulaCsv(valor)).toBe(`"'${valor.replace(/"/g, '""')}"`);
    },
  );

  it("não mexe em texto comum", () => {
    expect(escaparCelulaCsv("Hemoglobina")).toBe('"Hemoglobina"');
    expect(escaparCelulaCsv("10 ago 2026")).toBe('"10 ago 2026"');
  });

  it("duplica aspas internas, para não romper a célula", () => {
    expect(escaparCelulaCsv('diz "oi"')).toBe('"diz ""oi"""');
  });

  it("escapa o separador e a quebra de linha mantendo-os dentro da célula", () => {
    expect(escaparCelulaCsv("a,b")).toBe('"a,b"');
    expect(escaparCelulaCsv("a\nb")).toBe('"a\nb"');
  });

  it("vira célula vazia quando não há valor", () => {
    expect(escaparCelulaCsv(null)).toBe('""');
    expect(escaparCelulaCsv(undefined)).toBe('""');
    expect(escaparCelulaCsv(0)).toBe('"0"');
  });
});

describe("gerarCsvHistorico", () => {
  const dados = {
    secoes: [
      { titulo: "Exames", colunas: ["Índice", "Valor"], linhas: [["Hemoglobina", "14,1"]] },
      { titulo: "TAF", colunas: ["Prova", "Resultado"], linhas: [["=cmd", "Apto"]] },
    ],
  };

  it("escapa toda célula, inclusive título e cabeçalho", () => {
    const csv = gerarCsvHistorico(dados);
    expect(csv).toContain('"Exames"');
    expect(csv).toContain('"Índice","Valor"');
    // A fórmula veio de dado do usuário e sai neutralizada.
    expect(csv).toContain("\"'=cmd\",\"Apto\"");
    expect(csv).not.toContain('"=cmd"');
  });

  it("usa CRLF e começa com BOM, para o Excel abrir com acento certo", () => {
    const csv = gerarCsvHistorico(dados);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("\r\n");
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("separa seções por uma linha em branco", () => {
    const linhas = gerarCsvHistorico(dados).split("\r\n");
    expect(linhas).toContain("");
  });
});
