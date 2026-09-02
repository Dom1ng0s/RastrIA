// Painel de notificações (issue #117) — peça de interface, não geração real
// de eventos (que depende do backend da issue #31, ainda não implementada).
// Conteúdo mockado, diferente por papel (mesmo componente de interface,
// compartilhado pelos 4 dashboards via DashboardLayout).
export const NOTIFICACOES_MOCK_POR_PAPEL = {
  usuario: [
    { id: 1, titulo: "Solicitação confirmada por Dra. Camila Andrade", data: "15 ago 2026 · 14:32", lida: false },
    { id: 2, titulo: "Seu TAF foi registrado pelo educador físico responsável", data: "12 ago 2026 · 09:10", lida: true },
  ],
  medico: [
    { id: 1, titulo: "Nova solicitação de Ana Souza", data: "18 ago 2026 · 10:05", lida: false },
    { id: 2, titulo: "Nova solicitação de Carlos Lima", data: "17 ago 2026 · 16:40", lida: false },
  ],
  "educador-fisico": [
    { id: 1, titulo: "Nova solicitação de Diego Martins", data: "18 ago 2026 · 08:15", lida: false },
  ],
  comando: [
    { id: 1, titulo: "TAF atrasado — Sd. Marcos Lima", data: "20 ago 2026 · 07:00", lida: false },
    { id: 2, titulo: "Exame atrasado — Cb. Nunes", data: "19 ago 2026 · 07:00", lida: true },
  ],
};
