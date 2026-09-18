// Camada de dados do domínio "saúde" — registros do próprio usuário, registros
// de um integrante vistos por um profissional e TAF (issues #119 e #127).
// Hooks já no formato final do TanStack Query; hoje resolvem mocks locais.
//
// O parâmetro `escopo` ("clinico" | "fisico") é o que garante, no backend, que
// um educador físico nunca receba dado clínico — não é só regra de exibição no
// frontend. Ver "Regras de Design" em agents/claude.md.

import { useMockMutation, useMockQuery } from "../../lib/mockQuery";

const DELAY_DEMO_MS = 600; // referência visual de skeleton/erro (issue #120)

// --- Mocks (extraídos das telas — issue #127) --------------------------------

// `anexo` (issue #99) é opcional — aponta pra um PNG estático em public/mock/
// só pra demonstrar os botões "Visualizar"/"Baixar". Quando o upload real
// existir, a URL vem de um blob local (nesta sessão) ou de uma URL assinada do
// backend.
const REGISTROS_DO_USUARIO = [
  { id: 1, indice: "Pressão arterial", valor: "12/8", data: "10 ago 2026", status: "normal" },
  {
    id: 2,
    indice: "Glicemia em jejum",
    valor: "112 mg/dL",
    data: "14 ago 2026",
    status: "atencao",
    anexo: { nome: "glicemia-14-08.png", url: "/mock/exame-anexo-exemplo.png" },
  },
  { id: 3, indice: "IMC", valor: "23.4", data: "14 ago 2026", status: "normal" },
];

// TAF só é cadastrado por um educador físico (issue #7) — o usuário apenas
// visualiza o próprio último resultado.
const ULTIMO_TAF_DO_USUARIO = {
  data: "12 ago 2026",
  corrida: "11min 30s",
  flexoes: 32,
  abdominais: 40,
  barra: 6,
  resultado: "apto",
};

const REGISTROS_POR_ESCOPO = {
  clinico: [
    { id: 1, indice: "Hemograma completo", valor: "dentro da faixa", data: "28 jul 2026", status: "normal" },
    { id: 2, indice: "Glicemia em jejum", valor: "112 mg/dL", data: "14 ago 2026", status: "atencao" },
  ],
  fisico: [
    { id: 3, indice: "Corrida 5km", valor: "27min 40s", data: "05 ago 2026", status: "normal" },
    { id: 4, indice: "IMC", valor: "23.4", data: "14 ago 2026", status: "normal" },
  ],
};

// O médico também enxerga o resultado do TAF (é dado de desempenho físico, não
// dado clínico restrito — acompanha o paciente para fins ocupacionais/PCMSO),
// mas só em leitura: cadastrar continua sendo exclusivo do educador físico.
const TAF_POR_INTEGRANTE = {
  1: { data: "12 ago 2026", corrida: "11min 30s", flexoes: 32, abdominais: 40, barra: 6, resultado: "apto" },
  2: { data: "08 ago 2026", corrida: "12min 05s", flexoes: 25, abdominais: 35, barra: 3, resultado: "apto" },
};

// --- Consultas ---------------------------------------------------------------

/** GET /api/registros-saude — exames e índices do próprio usuário logado. */
export function useRegistrosSaude() {
  return useMockQuery({
    queryKey: ["registros-saude", "meus"],
    dados: REGISTROS_DO_USUARIO,
    delayMs: DELAY_DEMO_MS,
  });
}

/** GET /api/taf/ultimo — último TAF do próprio usuário (`null` se nunca fez). */
export function useUltimoTaf() {
  return useMockQuery({
    queryKey: ["taf", "meu", "ultimo"],
    dados: ULTIMO_TAF_DO_USUARIO,
    delayMs: DELAY_DEMO_MS,
  });
}

/** GET /api/integrantes/:id/registros?escopo= — registros vistos por um profissional. */
export function useRegistrosIntegrante(id, escopo) {
  return useMockQuery({
    queryKey: ["registros-saude", "integrante", id, escopo],
    dados: () => REGISTROS_POR_ESCOPO[escopo] ?? [],
    delayMs: DELAY_DEMO_MS,
  });
}

/** GET /api/integrantes/:id/taf/ultimo — último TAF do integrante (`null` se não houver). */
export function useTafIntegrante(id) {
  return useMockQuery({
    queryKey: ["taf", "integrante", id, "ultimo"],
    dados: () => TAF_POR_INTEGRANTE[id] ?? null,
    delayMs: DELAY_DEMO_MS,
  });
}

// --- Mutations ---------------------------------------------------------------

/** POST /api/registros-saude — cadastra exame ou exercício do próprio usuário. */
export function useCadastrarRegistro() {
  return useMockMutation();
}

/**
 * PATCH /api/registros-saude/:id — confirma a leitura de um resultado
 * "Alterado" (issue #97). Hoje a confirmação vive só na sessão; no backend
 * deve virar campo do próprio registro (ex: `visualizadoEm`).
 */
export function useConfirmarAlterado() {
  return useMockMutation();
}

/** POST /api/integrantes/:id/taf — cadastro de TAF pelo educador físico (issue #7). */
export function useCadastrarTaf() {
  return useMockMutation();
}
