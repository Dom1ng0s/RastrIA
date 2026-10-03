import {
  dataExibicaoParaFormulario,
  dataFormularioParaExibicao,
  dataRegistroSchema,
} from "./dataRegistro";

// Data do registro de exame/exercício/TAF (issue #37). O risco que motivou a
// validação é a data que casa a regex mas não existe, ou que está no futuro.

function mensagens(valor) {
  const resultado = dataRegistroSchema.safeParse(valor);
  return resultado.success ? [] : resultado.error.issues.map((i) => i.message);
}

describe("dataRegistroSchema", () => {
  it("aceita uma data passada no formato dd/mm/aaaa", () => {
    expect(dataRegistroSchema.safeParse("10/08/2026").success).toBe(true);
  });

  it("aceita hoje — o registro é de hoje no caso mais comum", () => {
    const hoje = new Date();
    const dd = String(hoje.getDate()).padStart(2, "0");
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");
    expect(dataRegistroSchema.safeParse(`${dd}/${mm}/${hoje.getFullYear()}`).success).toBe(true);
  });

  it("exige o campo e o formato", () => {
    expect(mensagens("")).toContain("Informe a data");
    expect(mensagens("10-08-2026")).toContain("Use o formato dd/mm/aaaa");
    expect(mensagens("1/8/2026")).toContain("Use o formato dd/mm/aaaa");
  });

  it.each(["31/02/2020", "30/02/2024", "29/02/2023", "00/01/2026", "10/13/2026"])(
    "rejeita %s, que casa a regex mas não existe no calendário",
    (valor) => {
      expect(mensagens(valor)).toContain("Data inexistente no calendário");
    },
  );

  it("aceita 29/02 em ano bissexto", () => {
    expect(dataRegistroSchema.safeParse("29/02/2024").success).toBe(true);
  });

  it("rejeita data futura", () => {
    const futuro = new Date();
    futuro.setFullYear(futuro.getFullYear() + 1);
    const dd = String(futuro.getDate()).padStart(2, "0");
    const mm = String(futuro.getMonth() + 1).padStart(2, "0");
    expect(mensagens(`${dd}/${mm}/${futuro.getFullYear()}`)).toContain(
      "A data não pode estar no futuro",
    );
  });
});

describe("conversão entre o formato da lista e o do formulário", () => {
  it("vai e volta sem perder a data (editar um registro, issue #130)", () => {
    expect(dataExibicaoParaFormulario("10 ago 2026")).toBe("10/08/2026");
    expect(dataFormularioParaExibicao("10/08/2026")).toBe("10 ago 2026");
    expect(dataFormularioParaExibicao(dataExibicaoParaFormulario("05 jan 2026"))).toBe("05 jan 2026");
  });

  it("devolve vazio quando a exibição não dá para interpretar", () => {
    expect(dataExibicaoParaFormulario("ontem")).toBe("");
    expect(dataExibicaoParaFormulario(undefined)).toBe("");
  });

  it("devolve a entrada quando o valor do formulário não é data", () => {
    expect(dataFormularioParaExibicao("31/02/2020")).toBe("31/02/2020");
  });
});
