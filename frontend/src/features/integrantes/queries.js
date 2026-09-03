// Camada de dados do domínio "integrantes" (dados cadastrais de um integrante
// visto por um profissional). Hook já no formato final do TanStack Query
// (issue #119) — hoje resolve um mock local.

import { useMockQuery } from "../../lib/mockQuery";

// Nomes mockados por escopo: um médico vê pacientes, um educador físico vê
// alunos, e os ids se repetem entre os dois conjuntos. O endpoint real
// (`GET /api/integrantes/:id`) devolve o integrante independentemente do papel —
// a segregação de quem pode ver quem é responsabilidade do backend.
const NOMES_POR_ESCOPO = {
  clinico: { 1: "Bruno Alves", 2: "Fernanda Dias" },
  fisico: { 1: "Diego Martins", 2: "Juliana Prado" },
};

/** GET /api/integrantes/:id — dados cadastrais do integrante. */
export function useIntegrante(id, escopo) {
  return useMockQuery({
    queryKey: ["integrantes", id, "cadastro", escopo],
    dados: () => {
      const nome = NOMES_POR_ESCOPO[escopo]?.[id];
      return nome ? { id, nome } : null;
    },
  });
}
