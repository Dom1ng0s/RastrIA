import { create } from "zustand";

import { NOTIFICACOES_MOCK_POR_PAPEL } from "./mock";

// Estado local (mockado), sem persistência entre sessões — decisão explícita
// da issue #117: geração real de evento, persistência de lida/excluída e
// notificação push/e-mail ficam para quando a #31 (backend) existir.
// TODO: substituir por dado real via TanStack Query (GET /api/notificacoes,
// PATCH /api/notificacoes/:id, DELETE /api/notificacoes/:id) quando os
// endpoints existirem.
export const useNotificacoesStore = create((set) => ({
  porPapel: NOTIFICACOES_MOCK_POR_PAPEL,

  marcarLida: (papel, id) =>
    set((state) => ({
      porPapel: {
        ...state.porPapel,
        [papel]: (state.porPapel[papel] ?? []).map((notificacao) =>
          notificacao.id === id ? { ...notificacao, lida: true } : notificacao,
        ),
      },
    })),

  marcarTodasLidas: (papel) =>
    set((state) => ({
      porPapel: {
        ...state.porPapel,
        [papel]: (state.porPapel[papel] ?? []).map((notificacao) => ({ ...notificacao, lida: true })),
      },
    })),

  excluir: (papel, id) =>
    set((state) => ({
      porPapel: {
        ...state.porPapel,
        [papel]: (state.porPapel[papel] ?? []).filter((notificacao) => notificacao.id !== id),
      },
    })),

  limparLidas: (papel) =>
    set((state) => ({
      porPapel: {
        ...state.porPapel,
        [papel]: (state.porPapel[papel] ?? []).filter((notificacao) => !notificacao.lida),
      },
    })),
}));
