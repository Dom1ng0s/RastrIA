// Painel de notificações (issue #117) — peça de interface, não geração real
// de eventos (que depende do backend da issue #31, ainda não implementada).
// Conteúdo mockado, diferente por papel (mesmo componente de interface,
// compartilhado pelos 4 dashboards via DashboardLayout).
//
// `destino` (issue #129) é a rota interna que a notificação abre ao ser
// clicada. O fragmento (`#ultimo-taf`) casa com o `data-tour` da seção
// correspondente na tela — o DashboardLayout rola até ela. Notificação sem
// `destino` continua sendo texto, sem virar link.
export const NOTIFICACOES_MOCK_POR_PAPEL = {
  usuario: [
    {
      id: 1,
      titulo: "Solicitação confirmada por Dra. Camila Andrade",
      data: "15 ago 2026 · 14:32",
      lida: false,
      destino: "/usuario/atendimentos",
    },
    {
      id: 2,
      titulo: "Seu TAF foi registrado pelo educador físico responsável",
      data: "12 ago 2026 · 09:10",
      lida: true,
      destino: "/usuario#ultimo-taf",
    },
  ],
  medico: [
    {
      id: 1,
      titulo: "Nova solicitação de Ana Souza",
      data: "18 ago 2026 · 10:05",
      lida: false,
      destino: "/medico#solicitacoes-pendentes",
    },
    {
      id: 2,
      titulo: "Nova solicitação de Carlos Lima",
      data: "17 ago 2026 · 16:40",
      lida: false,
      destino: "/medico#solicitacoes-pendentes",
    },
  ],
  "educador-fisico": [
    {
      id: 1,
      titulo: "Nova solicitação de Diego Martins",
      data: "18 ago 2026 · 08:15",
      lida: false,
      destino: "/educador-fisico#solicitacoes-pendentes",
    },
  ],
  comando: [
    {
      id: 1,
      titulo: "TAF atrasado — Sd. Marcos Lima",
      data: "20 ago 2026 · 07:00",
      lida: false,
      destino: "/gerente#exames-atrasados",
    },
    {
      id: 2,
      titulo: "Exame atrasado — Cb. Nunes",
      data: "19 ago 2026 · 07:00",
      lida: true,
      destino: "/gerente#exames-atrasados",
    },
  ],
};
