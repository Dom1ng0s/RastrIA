// Camada de dados do "ranking de desempenho físico" (issue #119). Hook já no
// formato final do TanStack Query — hoje resolve um mock; quando o endpoint
// existir, troca-se por `queryFn: () => api.get("/api/ranking?atividade=...")`.
//
// O ranking é sempre restrito a integrantes da MESMA instituição/corporação do
// usuário logado (nunca cross-instituição) — o backend aplica esse recorte.
// Tempo de atividade física não é dado clínico, então este ranking não é
// afetado pela regra de segregação de acesso do papel Comando (essa regra é
// sobre índice de saúde, não desempenho físico entre pares).

import { useMockQuery } from "../../lib/mockQuery";

const DELAY_DEMO_MS = 600; // referência visual de skeleton/erro (issue #120)

// --- Mock (extraído de RankingFisico.jsx — issue #119) ----------------------

const USUARIO_ATUAL_ID = 4;

// Batalhão de cada pessoa (consistente entre atividades) — habilita o filtro
// "meu batalhão" (issue #10).
const BATALHAO_POR_PESSOA = {
  1: "1º Batalhão",
  2: "2º Batalhão",
  3: "1º Batalhão",
  4: "1º Batalhão", // Você
  5: "3º Batalhão",
  6: "2º Batalhão",
  7: "3º Batalhão",
};

const RANKINGS_POR_ATIVIDADE = {
  "corrida-5km": [
    { id: 1, nome: "Sgt. Almeida", unidade: "1ª Companhia", tempo: "21:04" },
    { id: 2, nome: "Cb. Ferreira", unidade: "2ª Companhia", tempo: "21:47" },
    { id: 3, nome: "Sd. Rocha", unidade: "1ª Companhia", tempo: "22:12" },
    { id: 4, nome: "Você", unidade: "1ª Companhia", tempo: "22:58" },
    { id: 5, nome: "Cb. Nunes", unidade: "3ª Companhia", tempo: "23:20" },
    { id: 6, nome: "Sd. Barros", unidade: "2ª Companhia", tempo: "24:05" },
    { id: 7, nome: "Sgt. Lima", unidade: "3ª Companhia", tempo: "24:41" },
  ],
  "corrida-10km": [
    { id: 2, nome: "Cb. Ferreira", unidade: "2ª Companhia", tempo: "45:10" },
    { id: 3, nome: "Sd. Rocha", unidade: "1ª Companhia", tempo: "46:32" },
    { id: 1, nome: "Sgt. Almeida", unidade: "1ª Companhia", tempo: "47:01" },
    { id: 6, nome: "Sd. Barros", unidade: "2ª Companhia", tempo: "49:18" },
    { id: 4, nome: "Você", unidade: "1ª Companhia", tempo: "51:47" },
    { id: 5, nome: "Cb. Nunes", unidade: "3ª Companhia", tempo: "53:02" },
  ],
  "natacao-500m": [
    { id: 4, nome: "Você", unidade: "1ª Companhia", tempo: "9:12" },
    { id: 7, nome: "Sgt. Lima", unidade: "3ª Companhia", tempo: "9:30" },
    { id: 3, nome: "Sd. Rocha", unidade: "1ª Companhia", tempo: "9:58" },
    { id: 2, nome: "Cb. Ferreira", unidade: "2ª Companhia", tempo: "10:21" },
  ],
  "ciclismo-20km": [
    { id: 5, nome: "Cb. Nunes", unidade: "3ª Companhia", tempo: "38:15" },
    { id: 1, nome: "Sgt. Almeida", unidade: "1ª Companhia", tempo: "39:40" },
    { id: 4, nome: "Você", unidade: "1ª Companhia", tempo: "41:22" },
    { id: 6, nome: "Sd. Barros", unidade: "2ª Companhia", tempo: "43:07" },
    { id: 3, nome: "Sd. Rocha", unidade: "1ª Companhia", tempo: "44:50" },
  ],
};

/**
 * GET /api/ranking — devolve o ranking completo do usuário (todas as atividades
 * da corporação dele). Filtro por escopo/atividade, opt-out e cálculo de
 * posição continuam sendo lógica de apresentação da tela.
 */
export function useRankingFisico() {
  return useMockQuery({
    queryKey: ["ranking"],
    dados: {
      usuarioAtualId: USUARIO_ATUAL_ID,
      batalhaoPorPessoa: BATALHAO_POR_PESSOA,
      rankingsPorAtividade: RANKINGS_POR_ATIVIDADE,
    },
    delayMs: DELAY_DEMO_MS,
  });
}
