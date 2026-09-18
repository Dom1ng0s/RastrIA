// Camada de dados do domínio "atendimentos" — solicitações de acompanhamento,
// vínculos de cuidado, log de atendimentos realizados e busca de profissionais
// (issues #119 e #127). Hooks já no formato final do TanStack Query; hoje
// resolvem mocks locais.
//
// O fluxo é sempre solicitação → confirmação pelo profissional → vínculo
// contínuo, nunca matching instantâneo (Parecer CFM nº 15/2026, issue #75).
// Tudo é restrito à mesma instituição do usuário: desde 24/08/2026 não existe
// mais rede pré-qualificada entre instituições (ver agents/claude.md). O
// backend aplica esse recorte no próprio endpoint, não só na tela.

import { useQueryClient } from "@tanstack/react-query";

import { useMockMutation, useMockQuery } from "../../lib/mockQuery";

const DELAY_DEMO_MS = 600; // referência visual de skeleton/erro (issue #120)

// Chaves de cache em um lugar só: as mutations abaixo precisam delas para
// atualizar as listas, e a tela não deveria ter que conhecer nenhuma.
const chaves = {
  solicitacoesPendentes: (escopo) => ["solicitacoes", "pendentes", escopo],
  vinculosCuidado: (escopo) => ["vinculos-cuidado", escopo],
};

// --- Mocks (extraídos das telas — issue #127) --------------------------------

const SOLICITACOES_POR_ESCOPO = {
  clinico: [
    { id: 1, pessoa: "Ana Souza", especialidade: "Clínico geral", data: "18 ago 2026" },
    { id: 2, pessoa: "Carlos Lima", especialidade: "Cardiologia", data: "17 ago 2026" },
  ],
  fisico: [{ id: 1, pessoa: "Diego Martins", data: "18 ago 2026" }],
};

// Quem está sob acompanhamento AGORA (pacientes do médico, alunos do educador).
// Diferente do log de atendimentos realizados abaixo — issue #79.
const VINCULOS_POR_ESCOPO = {
  clinico: [
    { id: 1, nome: "Bruno Alves", ultimoContato: "10 ago 2026" },
    { id: 2, nome: "Fernanda Dias", ultimoContato: "05 ago 2026" },
  ],
  fisico: [
    { id: 1, nome: "Diego Martins", ultimoContato: "12 ago 2026" },
    { id: 2, nome: "Juliana Prado", ultimoContato: "08 ago 2026" },
  ],
};

const REALIZADOS_POR_ESCOPO = {
  clinico: [
    { id: 1, pessoaId: 1, pessoa: "Bruno Alves", data: "10 ago 2026", resumo: "Avaliação de rotina — exames dentro da faixa esperada." },
    { id: 2, pessoaId: 2, pessoa: "Fernanda Dias", data: "05 ago 2026", resumo: "Acompanhamento de glicemia alterada, solicitado novo exame em 30 dias." },
  ],
  fisico: [
    { id: 3, pessoaId: 1, pessoa: "Diego Martins", data: "12 ago 2026", resumo: "Avaliação de condicionamento antes do TAF." },
  ],
};

// Histórico do lado do usuário: atendimentos que ele já recebeu.
const MEUS_ATENDIMENTOS = [
  {
    id: 1,
    profissional: "Dra. Camila Andrade",
    especialidade: "Clínica Geral",
    data: "10 ago 2026",
    resumo: "Avaliação de rotina — pressão arterial e glicemia dentro da faixa esperada.",
  },
  {
    id: 2,
    profissional: "Felipe Souza",
    especialidade: "Educação Física",
    data: "02 ago 2026",
    resumo: "Avaliação de condicionamento físico antes do TAF.",
  },
];

// `instituicaoId` simula o vínculo institucional de cada profissional. O
// profissional da instituição 2 existe de propósito: é o que demonstra, na
// tela, que o fim da rede pré-qualificada está em vigor.
const PROFISSIONAIS = [
  { id: 1, tipo: "medico", nome: "Dra. Camila Andrade", especialidade: "Clínica Geral", disponibilidade: "Hoje, a partir das 14h", instituicaoId: 1 },
  { id: 2, tipo: "medico", nome: "Dr. Ricardo Nunes", especialidade: "Cardiologia", disponibilidade: "Amanhã, a partir das 9h", instituicaoId: 1 },
  { id: 3, tipo: "educador_fisico", nome: "Felipe Souza", especialidade: "Educação Física — Condicionamento", disponibilidade: "Hoje, a partir das 16h", instituicaoId: 1 },
  { id: 4, tipo: "educador_fisico", nome: "Marina Alves", especialidade: "Educação Física — Reabilitação", disponibilidade: "Amanhã, a partir das 10h", instituicaoId: 1 },
  { id: 5, tipo: "medico", nome: "Dr. Otávio Reis", especialidade: "Clínica Geral", disponibilidade: "Hoje, a partir das 11h", instituicaoId: 2 },
];

// --- Consultas ---------------------------------------------------------------

/** GET /api/solicitacoes?status=pendente — pedidos aguardando resposta do profissional. */
export function useSolicitacoesPendentes(escopo) {
  return useMockQuery({
    queryKey: chaves.solicitacoesPendentes(escopo),
    dados: () => SOLICITACOES_POR_ESCOPO[escopo] ?? [],
    delayMs: DELAY_DEMO_MS,
  });
}

/** GET /api/vinculos-cuidado — quem está sob acompanhamento do profissional logado. */
export function useVinculosCuidado(escopo) {
  return useMockQuery({
    queryKey: chaves.vinculosCuidado(escopo),
    dados: () => VINCULOS_POR_ESCOPO[escopo] ?? [],
    delayMs: DELAY_DEMO_MS,
  });
}

/** GET /api/atendimentos?profissional=me — log do que o profissional já concluiu. */
export function useAtendimentosRealizados(escopo) {
  return useMockQuery({
    queryKey: ["atendimentos", "realizados", escopo],
    dados: () => REALIZADOS_POR_ESCOPO[escopo] ?? [],
    delayMs: DELAY_DEMO_MS,
  });
}

/** GET /api/atendimentos?papel=usuario — histórico de quem foi atendido. */
export function useMeusAtendimentos() {
  return useMockQuery({
    queryKey: ["atendimentos", "meus"],
    dados: MEUS_ATENDIMENTOS,
    delayMs: DELAY_DEMO_MS,
  });
}

/** GET /api/profissionais?tipo=&instituicao= — profissionais da própria instituição. */
export function useProfissionaisDisponiveis(instituicaoId) {
  return useMockQuery({
    queryKey: ["profissionais", instituicaoId],
    dados: () => PROFISSIONAIS.filter((p) => p.instituicaoId === instituicaoId),
    delayMs: DELAY_DEMO_MS,
  });
}

// --- Mutations ---------------------------------------------------------------

/**
 * PATCH /api/solicitacoes/:id — confirma ou recusa um pedido (issue #73).
 * Recebe `{ solicitacao, acao: "confirmar" | "recusar" }`.
 *
 * A solicitação some da lista de pendentes nos dois casos; confirmar também
 * cria o vínculo de cuidado. Enquanto é mock, o hook escreve direto no cache
 * (a mudança some no reload, como antes). Quando o endpoint existir, estas
 * duas escritas viram `queryClient.invalidateQueries` e a tela não muda.
 */
export function useResponderSolicitacao(escopo) {
  const queryClient = useQueryClient();

  return useMockMutation(async ({ solicitacao, acao }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    queryClient.setQueryData(chaves.solicitacoesPendentes(escopo), (atual = []) =>
      atual.filter((item) => item.id !== solicitacao.id),
    );

    if (acao === "confirmar") {
      queryClient.setQueryData(chaves.vinculosCuidado(escopo), (atual = []) =>
        atual.some((vinculo) => vinculo.nome === solicitacao.pessoa)
          ? atual
          : [{ id: `sol-${solicitacao.id}`, nome: solicitacao.pessoa, ultimoContato: "—" }, ...atual],
      );
    }

    return { solicitacao, acao };
  });
}

/** POST /api/solicitacoes — usuário solicita acompanhamento a um profissional. */
export function useSolicitarAcompanhamento() {
  return useMockMutation();
}
