import { FileText } from "lucide-react";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

// TODO: substituir por dado real via TanStack Query (GET /api/atendimentos?papel=usuario)
// quando o endpoint existir. Diferente de SolicitarAcompanhamento (que mostra a
// solicitação pendente/em andamento), esta tela é o histórico do que já foi
// efetivamente atendido — ver issue "histórico de atendimentos (usuário e profissional)".
const atendimentosRealizados = [
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

export default function HistoricoAtendimentos() {
  return (
    <DashboardLayout title="Meus Atendimentos" navItems={navItems}>
      <p className="mb-6 text-sm text-text-muted">
        Atendimentos já realizados com profissionais da sua instituição. Para solicitar um novo,
        acesse "Solicitar Acompanhamento" no menu lateral.
      </p>

      <div className="space-y-3">
        {atendimentosRealizados.map((atendimento) => (
          <div key={atendimento.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{atendimento.profissional}</span>
              <span className="shrink-0 text-xs text-text-muted">{atendimento.data}</span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">{atendimento.especialidade}</p>
            <p className="mt-2 text-sm text-text-dark">{atendimento.resumo}</p>
          </div>
        ))}

        {atendimentosRealizados.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Você ainda não teve nenhum atendimento"
            description='Solicite acompanhamento a um profissional em "Solicitar Acompanhamento".'
            actionLabel="Solicitar acompanhamento"
            actionTo="/usuario/solicitar"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
