// Camada de dados do "ranking de desempenho físico" (issue #119). Hook já no
// formato final do TanStack Query — hoje resolve um mock; quando o endpoint
// existir, troca-se por `queryFn: () => api.get("/api/ranking")`.
//
// O ranking é sempre restrito a integrantes da MESMA instituição/corporação do
// usuário logado (nunca cross-instituição) — o backend aplica esse recorte.
// Tempo de atividade física não é dado clínico, então este ranking não é
// afetado pela regra de segregação de acesso do papel Comando (essa regra é
// sobre índice de saúde, não desempenho físico entre pares).

import { useMockQuery } from "../../lib/mockQuery";

const DELAY_DEMO_MS = 600; // referência visual de skeleton/erro (issue #120)

// --- Mock (extraído de RankingFisico.jsx — issue #125) ----------------------

const USUARIO_ATUAL_ID = 4;

const ATIVIDADES = [
  { id: "corrida-5km", label: "Corrida · 5km" },
  { id: "corrida-10km", label: "Corrida · 10km" },
  { id: "natacao-500m", label: "Natação · 500m" },
  { id: "ciclismo-20km", label: "Ciclismo · 20km" },
];

// Fonte única de verdade de cada integrante: batalhão + companhia consistentes
// entre todas as atividades. As listas de classificação referenciam só
// `id` + `tempo`; nome e unidade vêm daqui.
//
// Antes cada linha de ranking carregava a unidade solta, o que não reconciliava
// com o filtro "meu batalhão" (issue #76). A tela já tinha sido corrigida para
// este formato, mas a cópia do mock aqui tinha ficado no formato antigo — e as
// duas já divergiam (Sd. Rocha aparecia em companhias diferentes em cada uma).
// Essa divergência silenciosa é exatamente o motivo da issue #125.
const PESSOAS = {
  1: { nome: "Sgt. Almeida", batalhao: "1º Batalhão", companhia: "1ª Companhia" },
  2: { nome: "Cb. Ferreira", batalhao: "2º Batalhão", companhia: "1ª Companhia" },
  3: { nome: "Sd. Rocha", batalhao: "1º Batalhão", companhia: "2ª Companhia" },
  4: { nome: "Você", batalhao: "1º Batalhão", companhia: "2ª Companhia" },
  5: { nome: "Cb. Nunes", batalhao: "3º Batalhão", companhia: "1ª Companhia" },
  6: { nome: "Sd. Barros", batalhao: "2º Batalhão", companhia: "2ª Companhia" },
  7: { nome: "Sgt. Lima", batalhao: "3º Batalhão", companhia: "2ª Companhia" },
};

const RANKINGS_POR_ATIVIDADE = {
  "corrida-5km": [
    { id: 1, tempo: "21:04" },
    { id: 2, tempo: "21:47" },
    { id: 3, tempo: "22:12" },
    { id: 4, tempo: "22:58" },
    { id: 5, tempo: "23:20" },
    { id: 6, tempo: "24:05" },
    { id: 7, tempo: "24:41" },
  ],
  "corrida-10km": [
    { id: 2, tempo: "45:10" },
    { id: 3, tempo: "46:32" },
    { id: 1, tempo: "47:01" },
    { id: 6, tempo: "49:18" },
    { id: 4, tempo: "51:47" },
    { id: 5, tempo: "53:02" },
  ],
  "natacao-500m": [
    { id: 4, tempo: "9:12" },
    { id: 7, tempo: "9:30" },
    { id: 3, tempo: "9:58" },
    { id: 2, tempo: "10:21" },
  ],
  "ciclismo-20km": [
    { id: 5, tempo: "38:15" },
    { id: 1, tempo: "39:40" },
    { id: 4, tempo: "41:22" },
    { id: 6, tempo: "43:07" },
    { id: 3, tempo: "44:50" },
  ],
};

/**
 * GET /api/ranking — ranking completo do usuário (todas as atividades da
 * corporação dele). Filtro por escopo/atividade, busca por nome, opt-out e
 * cálculo de posição continuam sendo lógica de apresentação da tela.
 */
export function useRankingFisico() {
  return useMockQuery({
    queryKey: ["ranking"],
    dados: {
      usuarioAtualId: USUARIO_ATUAL_ID,
      atividades: ATIVIDADES,
      pessoas: PESSOAS,
      rankingsPorAtividade: RANKINGS_POR_ATIVIDADE,
    },
    delayMs: DELAY_DEMO_MS,
  });
}
