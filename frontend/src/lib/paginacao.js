/**
 * Regras puras da paginação de listas (issue #121), separadas do componente
 * `Paginacao` para serem testadas sem DOM.
 *
 * Hoje a paginação é client-side, sobre o array que a query devolve. Quando a
 * API existir, o backend já pagina (`PaginacaoPadrao` em
 * backend/apps/core/paginacao.py: `?page=N&page_size=M`, resposta com `count`,
 * `next`, `previous`, `results`) e o componente continua o mesmo: quem chama
 * passa `totalPaginas = Math.ceil(count / page_size)` e busca a página nova
 * em `aoMudarPagina`, em vez de fatiar o array com `paginar`.
 * TODO(integração #121): trocar `paginar` por `page`/`page_size` na queryFn.
 */

/**
 * Fatia `itens` na página pedida. Página fora do intervalo é ajustada para a
 * mais próxima — filtro/busca que encolhe a lista nunca deixa a tela numa
 * página vazia.
 *
 * @template T
 * @param {T[]} itens
 * @param {number} pagina 1-based
 * @param {number} tamanho itens por página (> 0)
 * @returns {{ itensDaPagina: T[], paginaAtual: number, totalPaginas: number }}
 */
export function paginar(itens, pagina, tamanho) {
  const totalPaginas = Math.max(1, Math.ceil(itens.length / tamanho));
  const paginaAtual = Math.min(Math.max(1, Math.trunc(pagina) || 1), totalPaginas);
  const inicio = (paginaAtual - 1) * tamanho;
  return { itensDaPagina: itens.slice(inicio, inicio + tamanho), paginaAtual, totalPaginas };
}

/**
 * Números de página a exibir: sempre a primeira, a última e as vizinhas da
 * atual; o resto vira reticências (`null`). Com até 7 páginas, mostra todas.
 *
 * @param {number} atual
 * @param {number} total
 * @returns {(number | null)[]}
 */
export function paginasVisiveis(atual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set([1, total, atual - 1, atual, atual + 1]);
  if (atual <= 4) [2, 3, 4, 5].forEach((p) => paginas.add(p));
  if (atual >= total - 3) [total - 4, total - 3, total - 2, total - 1].forEach((p) => paginas.add(p));

  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const resultado = [];
  ordenadas.forEach((pagina, indice) => {
    if (indice > 0 && pagina - ordenadas[indice - 1] > 1) resultado.push(null);
    resultado.push(pagina);
  });
  return resultado;
}
