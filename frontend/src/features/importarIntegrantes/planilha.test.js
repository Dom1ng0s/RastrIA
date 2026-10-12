import { ALIASES_COLUNA, NOMES_COLUNA, normalizarCabecalho, processarPlanilhaIntegrantes } from "./planilha";

// Issue #176: a tela pedia a coluna "Telefone ou e-mail" e o parser não a
// reconhecia. Estes testes amarram o rótulo exibido aos aliases aceitos.

describe("NOMES_COLUNA", () => {
  it("tem um nome exibido para toda coluna que o parser procura", () => {
    expect(Object.keys(NOMES_COLUNA).sort()).toEqual(Object.keys(ALIASES_COLUNA).sort());
  });

  it.each(Object.entries(NOMES_COLUNA))("o rótulo de %s é aceito pelo parser", (chave, nome) => {
    const aliases = ALIASES_COLUNA[chave].map(normalizarCabecalho);
    expect(aliases).toContain(normalizarCabecalho(nome));
  });
});

describe("processarPlanilhaIntegrantes", () => {
  it("importa um CSV com o cabeçalho exatamente como a tela descreve", () => {
    const cabecalho = Object.values(NOMES_COLUNA).join(",");
    const csv = `${cabecalho}\nMaria da Silva,529.982.247-25,01/02/1990,F,(82) 99999-0000\n`;

    const { colunasFaltando, registros } = processarPlanilhaIntegrantes(csv);

    expect(colunasFaltando).toEqual([]);
    expect(registros).toHaveLength(1);
    expect(registros[0].erros).toEqual([]);
    expect(registros[0].contato).toBe("(82) 99999-0000");
  });

  it("aceita variação sem acento e com caixa diferente", () => {
    const csv = "NOME COMPLETO,cpf,Data de Nascimento,sexo,TELEFONE OU EMAIL\nJoão,529.982.247-25,01/02/1990,M,joao@pm.al.gov.br\n";
    expect(processarPlanilhaIntegrantes(csv).colunasFaltando).toEqual([]);
  });
});
