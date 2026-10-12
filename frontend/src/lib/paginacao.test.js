import { paginar, paginasVisiveis } from "./paginacao";

// Issue #121.

describe("paginar", () => {
  const itens = [1, 2, 3, 4, 5, 6, 7];

  it("fatia a página pedida", () => {
    expect(paginar(itens, 1, 5)).toEqual({ itensDaPagina: [1, 2, 3, 4, 5], paginaAtual: 1, totalPaginas: 2 });
    expect(paginar(itens, 2, 5)).toEqual({ itensDaPagina: [6, 7], paginaAtual: 2, totalPaginas: 2 });
  });

  it("ajusta página fora do intervalo (lista encolheu por filtro)", () => {
    expect(paginar(itens, 9, 5).paginaAtual).toBe(2);
    expect(paginar(itens, 0, 5).paginaAtual).toBe(1);
    expect(paginar(itens, Number.NaN, 5).paginaAtual).toBe(1);
  });

  it("lista vazia tem uma página, vazia", () => {
    expect(paginar([], 3, 5)).toEqual({ itensDaPagina: [], paginaAtual: 1, totalPaginas: 1 });
  });
});

describe("paginasVisiveis", () => {
  it("mostra todas com até 7 páginas", () => {
    expect(paginasVisiveis(1, 1)).toEqual([1]);
    expect(paginasVisiveis(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("encurta com reticências no começo, meio e fim", () => {
    expect(paginasVisiveis(1, 20)).toEqual([1, 2, 3, 4, 5, null, 20]);
    expect(paginasVisiveis(10, 20)).toEqual([1, null, 9, 10, 11, null, 20]);
    expect(paginasVisiveis(20, 20)).toEqual([1, null, 16, 17, 18, 19, 20]);
  });

  it("sempre inclui a página atual, a primeira e a última", () => {
    for (let atual = 1; atual <= 30; atual += 1) {
      const paginas = paginasVisiveis(atual, 30);
      expect(paginas).toContain(atual);
      expect(paginas[0]).toBe(1);
      expect(paginas.at(-1)).toBe(30);
    }
  });
});
