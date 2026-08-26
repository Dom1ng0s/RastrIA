import { AlertCircle, LayoutDashboard, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";

const navItems = [
  { to: "/educador-fisico", label: "Painel do Educador Físico", icon: LayoutDashboard, tour: "nav-painel" },
  { to: "/educador-fisico/atendimentos", label: "Meus Atendimentos", icon: Users },
];

const tourSteps = [
  {
    target: "[data-tour='solicitacoes-pendentes']",
    title: "Solicitações pendentes",
    content: "Confirme ou recuse pedidos de acompanhamento de integrantes da sua instituição.",
    disableBeacon: true,
  },
  {
    target: "[data-tour='meus-alunos']",
    title: "Meus alunos",
    content: "Acesse a avaliação física de cada aluno sob seu acompanhamento, incluindo o cadastro do TAF.",
  },
];

// TODO: substituir por dados reais via TanStack Query quando os endpoints existirem.
const solicitacoes = [{ id: 1, usuario: "Diego Martins", data: "18 ago 2026" }];

const alunos = [
  { id: 1, nome: "Diego Martins", ultimaAvaliacao: "12 ago 2026" },
  { id: 2, nome: "Juliana Prado", ultimaAvaliacao: "08 ago 2026" },
];

export default function DashboardEducadorFisico() {
  const { run, handleCallback, restart } = useGuidedTour("educador-fisico");

  return (
    <DashboardLayout title="Painel do Educador Físico" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <p className="mb-6 text-sm text-text-muted">
        Escopo restrito a desempenho físico — sem acesso a dado clínico (ver "Regras de Design"
        em agents/claude.md).
      </p>

      <section className="mb-10" data-tour="solicitacoes-pendentes">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
          Solicitações pendentes
        </h2>
        <div className="space-y-3">
          {solicitacoes.map((solicitacao) => (
            <div
              key={solicitacao.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            >
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{solicitacao.usuario}</p>
              <div className="flex shrink-0 gap-2">
                <button className="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold">Confirmar</button>
                <button className="btn-outline rounded-lg px-3 py-1.5 text-xs font-semibold">Recusar</button>
              </div>
            </div>
          ))}

          {solicitacoes.length === 0 && (
            <EmptyState icon={AlertCircle} title="Nenhuma solicitação pendente no momento" />
          )}
        </div>
      </section>

      <section data-tour="meus-alunos">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Meus alunos</h2>
        <div className="space-y-2">
          {alunos.map((aluno) => (
            <Link
              key={aluno.id}
              to={`/educador-fisico/aluno/${aluno.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{aluno.nome}</span>
              <span className="shrink-0 text-xs text-text-muted">Última avaliação · {aluno.ultimaAvaliacao}</span>
            </Link>
          ))}

          {alunos.length === 0 && (
            <EmptyState
              icon={Users}
              title="Nenhum aluno sob sua responsabilidade ainda"
              description="Alunos aparecem aqui quando um integrante da sua instituição solicita e você confirma o acompanhamento."
            />
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
