import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";

const navItems = [{ to: "/medico", label: "Painel do Médico", icon: LayoutDashboard, tour: "nav-painel" }];

const tourSteps = [
  {
    target: "[data-tour='solicitacoes-pendentes']",
    title: "Solicitações pendentes",
    content: "Confirme ou recuse pedidos de acompanhamento de integrantes da sua instituição.",
    disableBeacon: true,
  },
  {
    target: "[data-tour='meus-pacientes']",
    title: "Meus pacientes",
    content: "Acesse o histórico de cada paciente sob seu acompanhamento.",
  },
];

// TODO: substituir por dados reais via TanStack Query (GET /api/solicitacoes,
// GET /api/vinculos-cuidado) quando os endpoints estiverem prontos.
const solicitacoes = [
  { id: 1, paciente: "Ana Souza", especialidade: "Clínico geral", data: "18 ago 2026" },
  { id: 2, paciente: "Carlos Lima", especialidade: "Cardiologia", data: "17 ago 2026" },
];

const pacientes = [
  { id: 1, nome: "Bruno Alves", ultimoExame: "10 ago 2026" },
  { id: 2, nome: "Fernanda Dias", ultimoExame: "05 ago 2026" },
];

export default function DashboardMedico() {
  const { run, handleCallback, restart } = useGuidedTour("medico");

  return (
    <DashboardLayout title="Painel do Médico" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

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
              <div>
                <p className="text-sm font-medium">{solicitacao.paciente}</p>
                <p className="text-xs text-text-muted">
                  {solicitacao.especialidade} · {solicitacao.data}
                </p>
              </div>
              <div className="flex gap-2">
                {/* TODO: confirmar/recusar via mutation (PATCH /api/solicitacoes/:id) —
                    fluxo é sempre solicitação → confirmação, nunca aceite automático */}
                <button className="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold">Confirmar</button>
                <button className="btn-outline rounded-lg px-3 py-1.5 text-xs font-semibold">Recusar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section data-tour="meus-pacientes">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Meus pacientes</h2>
        <div className="space-y-2">
          {pacientes.map((paciente) => (
            <Link
              key={paciente.id}
              to={`/medico/paciente/${paciente.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
            >
              <span className="text-sm font-medium">{paciente.nome}</span>
              <span className="text-xs text-text-muted">Último exame · {paciente.ultimoExame}</span>
            </Link>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
