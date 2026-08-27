import { AlertCircle, LayoutDashboard, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { CampoBusca } from "../../components/CampoBusca";
import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";

const navItems = [
  { to: "/medico", label: "Painel do Médico", icon: LayoutDashboard, tour: "nav-painel" },
  { to: "/medico/atendimentos", label: "Meus Atendimentos", icon: Users },
];

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
  const [buscaPaciente, setBuscaPaciente] = useState("");

  const pacientesFiltrados = pacientes.filter((paciente) =>
    paciente.nome.toLowerCase().includes(buscaPaciente.toLowerCase()),
  );

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
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{solicitacao.paciente}</p>
                <p className="truncate text-xs text-text-muted">
                  {solicitacao.especialidade} · {solicitacao.data}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {/* TODO: confirmar/recusar via mutation (PATCH /api/solicitacoes/:id) —
                    fluxo é sempre solicitação → confirmação, nunca aceite automático */}
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

      <section data-tour="meus-pacientes">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Meus pacientes</h2>
        <CampoBusca valor={buscaPaciente} aoMudar={setBuscaPaciente} placeholder="Buscar paciente por nome..." />
        <div className="mt-3 space-y-2">
          {pacientesFiltrados.map((paciente) => (
            <Link
              key={paciente.id}
              to={`/medico/paciente/${paciente.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{paciente.nome}</span>
              <span className="shrink-0 text-xs text-text-muted">Último exame · {paciente.ultimoExame}</span>
            </Link>
          ))}

          {pacientes.length === 0 && (
            <EmptyState
              icon={Users}
              title="Nenhum paciente sob sua responsabilidade ainda"
              description="Pacientes aparecem aqui quando um integrante da sua instituição solicita e você confirma o acompanhamento."
            />
          )}

          {pacientes.length > 0 && pacientesFiltrados.length === 0 && (
            <p className="py-6 text-center text-sm text-text-muted">
              Nenhum paciente encontrado com esse nome.
            </p>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
