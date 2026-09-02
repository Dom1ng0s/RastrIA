import { AlertCircle, LayoutDashboard, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { CampoBusca } from "../../components/CampoBusca";
import { DashboardLayout } from "../../components/DashboardLayout";
import { DemoToggle } from "../../components/DemoToggle";
import { EmptyState } from "../../components/EmptyState";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";
import { useToast } from "../../features/ui/ToastProvider";

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
const solicitacoesIniciais = [{ id: 1, usuario: "Diego Martins", data: "18 ago 2026" }];

const alunosIniciais = [
  { id: 1, nome: "Diego Martins", ultimaAvaliacao: "12 ago 2026" },
  { id: 2, nome: "Juliana Prado", ultimaAvaliacao: "08 ago 2026" },
];

export default function DashboardEducadorFisico() {
  const { run, handleCallback, restart } = useGuidedTour();
  const { showToast } = useToast();
  const [buscaAluno, setBuscaAluno] = useState("");
  // Estado local para o mock reagir a confirmar/recusar (issue #73) — sem
  // endpoint ainda, a mudança some no reload. TODO: PATCH /api/solicitacoes/:id
  // (fluxo é sempre solicitação → confirmação) + refetch de "Meus alunos".
  const [solicitacoes, setSolicitacoes] = useState(solicitacoesIniciais);
  const [alunos, setAlunos] = useState(alunosIniciais);
  // Modo demo (issue #80) — ver components/DemoToggle.jsx.
  const [contaNova, setContaNova] = useState(false);
  const solicitacoesExibidas = contaNova ? [] : solicitacoes;
  const alunosExibidos = contaNova ? [] : alunos;

  const alunosFiltrados = alunosExibidos.filter((aluno) =>
    aluno.nome.toLowerCase().includes(buscaAluno.toLowerCase()),
  );

  function confirmarSolicitacao(solicitacao) {
    setSolicitacoes((atual) => atual.filter((item) => item.id !== solicitacao.id));
    setAlunos((atual) =>
      atual.some((aluno) => aluno.nome === solicitacao.usuario)
        ? atual
        : [{ id: `sol-${solicitacao.id}`, nome: solicitacao.usuario, ultimaAvaliacao: "—" }, ...atual],
    );
    showToast("Solicitação confirmada");
  }

  function recusarSolicitacao(solicitacao) {
    setSolicitacoes((atual) => atual.filter((item) => item.id !== solicitacao.id));
    showToast("Solicitação recusada");
  }

  return (
    <DashboardLayout title="Painel do Educador Físico" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <DemoToggle contaNova={contaNova} onToggle={() => setContaNova((atual) => !atual)} />

      <p className="mb-6 text-sm text-text-muted">
        Escopo restrito a desempenho físico — sem acesso a dado clínico.
      </p>

      <section className="mb-10" data-tour="solicitacoes-pendentes">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
          Solicitações pendentes
        </h2>
        <div className="space-y-3">
          {solicitacoesExibidas.map((solicitacao) => (
            <div
              key={solicitacao.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            >
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{solicitacao.usuario}</p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => confirmarSolicitacao(solicitacao)}
                  className="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => recusarSolicitacao(solicitacao)}
                  className="btn-outline rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}

          {solicitacoesExibidas.length === 0 && (
            <EmptyState icon={AlertCircle} title="Nenhuma solicitação pendente no momento" />
          )}
        </div>
      </section>

      <section data-tour="meus-alunos">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Meus alunos</h2>
        <CampoBusca valor={buscaAluno} aoMudar={setBuscaAluno} placeholder="Buscar aluno por nome..." />
        <div className="mt-3 space-y-2">
          {alunosFiltrados.map((aluno) => (
            <Link
              key={aluno.id}
              to={`/educador-fisico/aluno/${aluno.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{aluno.nome}</span>
              <span className="shrink-0 text-xs text-text-muted">Última avaliação · {aluno.ultimaAvaliacao}</span>
            </Link>
          ))}

          {alunosExibidos.length === 0 && (
            <EmptyState
              icon={Users}
              title="Nenhum aluno sob sua responsabilidade ainda"
              description="Alunos aparecem aqui quando um integrante da sua instituição solicita e você confirma o acompanhamento."
            />
          )}

          {alunosExibidos.length > 0 && alunosFiltrados.length === 0 && (
            <p className="py-6 text-center text-sm text-text-muted">Nenhum aluno encontrado com esse nome.</p>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
