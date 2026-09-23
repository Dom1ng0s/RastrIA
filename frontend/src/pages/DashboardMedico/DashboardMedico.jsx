import { AlertCircle, LayoutDashboard, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { CampoBusca } from "../../components/CampoBusca";
import { DashboardLayout } from "../../components/DashboardLayout";
import { DemoToggle } from "../../components/DemoToggle";
import { EmptyState } from "../../components/EmptyState";
import { EstadoErro } from "../../components/EstadoErro";
import { SkeletonLista } from "../../components/Skeleton";
import {
  useResponderSolicitacao,
  useSolicitacoesPendentes,
  useVinculosCuidado,
} from "../../features/atendimentos/queries";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";
import { useToast } from "../../features/ui/ToastProvider";

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

// Solicitações e vínculos de cuidado vêm de features/atendimentos/queries.js
// (issue #127). O fluxo é sempre solicitação → confirmação pelo profissional,
// nunca aceite automático (Parecer CFM nº 15/2026, issue #75).
export default function DashboardMedico() {
  const { run, handleCallback, restart } = useGuidedTour();
  const { showToast } = useToast();
  const [buscaPaciente, setBuscaPaciente] = useState("");
  // Modo demo (issue #80) — as listas mockadas nunca ficam vazias sozinhas;
  // este toggle simula "conta nova" sem descartar o dado do mock.
  const [contaNova, setContaNova] = useState(false);

  const solicitacoes = useSolicitacoesPendentes("clinico");
  const pacientes = useVinculosCuidado("clinico");
  const responder = useResponderSolicitacao("clinico");

  const solicitacoesExibidas = contaNova ? [] : solicitacoes.data ?? [];
  const pacientesExibidos = contaNova ? [] : pacientes.data ?? [];

  const pacientesFiltrados = pacientesExibidos.filter((paciente) =>
    paciente.nome.toLowerCase().includes(buscaPaciente.toLowerCase()),
  );

  function responderSolicitacao(solicitacao, acao) {
    responder.mutate(
      { solicitacao, acao },
      {
        onSuccess: () =>
          showToast(acao === "confirmar" ? "Solicitação confirmada" : "Solicitação recusada"),
        onError: () => showToast("Não foi possível responder à solicitação"),
      },
    );
  }

  return (
    <DashboardLayout title="Painel do Médico" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <DemoToggle contaNova={contaNova} onToggle={() => setContaNova((atual) => !atual)} />

      <section className="mb-10" data-tour="solicitacoes-pendentes">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
          Solicitações pendentes
        </h2>
        <div className="space-y-3">
          {solicitacoes.isLoading && <SkeletonLista itens={2} />}

          {solicitacoes.isError && (
            <EstadoErro
              title="Não foi possível carregar as solicitações"
              onRetry={solicitacoes.refetch}
            />
          )}

          {solicitacoesExibidas.map((solicitacao) => (
            <div
              key={solicitacao.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{solicitacao.pessoa}</p>
                <p className="truncate text-xs text-text-muted">
                  {solicitacao.especialidade} · {solicitacao.data}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => responderSolicitacao(solicitacao, "confirmar")}
                  disabled={responder.isPending}
                  className="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  Confirmar<span className="sr-only"> solicitação de {solicitacao.pessoa}</span>
                </button>
                <button
                  type="button"
                  onClick={() => responderSolicitacao(solicitacao, "recusar")}
                  disabled={responder.isPending}
                  className="btn-outline rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                >
                  Recusar<span className="sr-only"> solicitação de {solicitacao.pessoa}</span>
                </button>
              </div>
            </div>
          ))}

          {solicitacoes.isSuccess && solicitacoesExibidas.length === 0 && (
            <EmptyState icon={AlertCircle} title="Nenhuma solicitação pendente no momento" />
          )}
        </div>
      </section>

      <section data-tour="meus-pacientes">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Meus pacientes</h2>
        <CampoBusca rotulo="Buscar paciente" valor={buscaPaciente} aoMudar={setBuscaPaciente} placeholder="Buscar paciente por nome..." />
        <div className="mt-3 space-y-2">
          {pacientes.isLoading && <SkeletonLista itens={2} />}

          {pacientes.isError && (
            <EstadoErro title="Não foi possível carregar seus pacientes" onRetry={pacientes.refetch} />
          )}

          {pacientesFiltrados.map((paciente) => (
            <Link
              key={paciente.id}
              to={`/medico/paciente/${paciente.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{paciente.nome}</span>
              <span className="shrink-0 text-xs text-text-muted">Último contato · {paciente.ultimoContato}</span>
            </Link>
          ))}

          {pacientes.isSuccess && pacientesExibidos.length === 0 && (
            <EmptyState
              icon={Users}
              title="Nenhum paciente sob sua responsabilidade ainda"
              description="Pacientes aparecem aqui quando um integrante da sua instituição solicita e você confirma o acompanhamento."
            />
          )}

          {pacientes.isSuccess && pacientesExibidos.length > 0 && pacientesFiltrados.length === 0 && (
            <p className="py-6 text-center text-sm text-text-muted">
              Nenhum paciente encontrado com esse nome.
            </p>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
