// Camada de dados do domínio "instituições" (painel agregado do Comando,
// exames administrativos atrasados, nome de instituição). Hooks já no formato
// final do TanStack Query (issue #119) — hoje resolvem mocks locais.

import { useMockQuery } from "../../lib/mockQuery";

// --- Mocks (extraídos das telas — issue #119) --------------------------------

// Exceção deliberada à regra "Comando nunca vê dado individual nominal" (issue
// #11): o que aparece aqui é só o STATUS ADMINISTRATIVO de pendência (nome +
// tipo de exame + atraso), nunca o resultado/valor clínico.
const EXAMES_ATRASADOS = [
  { id: 1, nome: "Sd. João Pereira", unidade: "1º Batalhão", exame: "Exame de sangue de rotina", diasAtraso: 12 },
  { id: 2, nome: "Cb. Ana Ramos", unidade: "2º Batalhão", exame: "Avaliação cardiológica anual", diasAtraso: 5 },
  { id: 3, nome: "Sd. Marcos Lima", unidade: "3º Batalhão", exame: "TAF", diasAtraso: 20 },
];

// Hierarquia multinível (Batalhão/Companhia/Pelotão) ainda depende de
// confirmação do piloto institucional.
const UNIDADES_AGREGADO = [
  {
    id: 1,
    nome: "1º Batalhão",
    percentual: 94,
    subunidades: [
      { nome: "1ª Companhia", percentual: 96 },
      { nome: "2ª Companhia", percentual: 91 },
      { nome: "3ª Companhia", percentual: 95 },
    ],
  },
  {
    id: 2,
    nome: "2º Batalhão",
    percentual: 88,
    subunidades: [
      { nome: "1ª Companhia", percentual: 85 },
      { nome: "2ª Companhia", percentual: 90 },
    ],
  },
  {
    id: 3,
    nome: "3º Batalhão",
    percentual: 95,
    subunidades: [
      { nome: "1ª Companhia", percentual: 97 },
      { nome: "2ª Companhia", percentual: 94 },
      { nome: "3ª Companhia", percentual: 95 },
    ],
  },
];

const NOMES_INSTITUICAO = { 1: "Batalhão PMAL", 2: "Outra instituição" };

// --- Hooks -------------------------------------------------------------------

/** GET /api/registros-saude?atrasados= — pendências administrativas do efetivo. */
export function useExamesAtrasados() {
  return useMockQuery({ queryKey: ["exames-atrasados"], dados: EXAMES_ATRASADOS });
}

/** GET /api/instituicoes/:id/agregado — percentual em dia por unidade/subunidade. */
export function useUnidadesAgregado() {
  return useMockQuery({ queryKey: ["instituicoes", "agregado"], dados: UNIDADES_AGREGADO });
}

/** GET /api/instituicoes/:id — nome da instituição (`null` se desconhecida). */
export function useNomeInstituicao(id) {
  return useMockQuery({
    queryKey: ["instituicoes", id, "nome"],
    dados: () => NOMES_INSTITUICAO[id] ?? null,
  });
}
