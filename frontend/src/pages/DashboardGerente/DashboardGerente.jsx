import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";

export const navItems = [
  { to: "/gerente", label: "Painel Agregado", icon: LayoutDashboard, tour: "nav-agregado" },
];

const tourSteps = [
  {
    target: "[data-tour='efetivo-geral']",
    title: "Efetivo geral",
    content:
      "Indicador agregado do percentual de exames em dia — este painel nunca mostra dado clínico individual nominal.",
    disableBeacon: true,
  },
  {
    target: "[data-tour='por-unidade']",
    title: "Por unidade",
    content: "Acompanhe o percentual em dia de cada batalhão e clique para ver o detalhamento por unidade.",
  },
];

// TODO: substituir por dados reais via TanStack Query (GET /api/instituicoes/:id/agregado)
// quando o endpoint existir. Hierarquia multinível (Batalhão/Companhia/Pelotão) ainda
// depende de confirmação do piloto institucional — ver agents/claude.md.
export const unidades = [
  {
    id: 1,
    nome: "1º Batalhão",
    percentual: 94,
    subunidades: [
      { nome: "1ª Companhia", percentual: 96 },
      { nome: "2ª Companhia", percentual: 91 },
      { nome: "3ª Companhia", percentual: 95 },
    ],
  },
  {
    id: 2,
    nome: "2º Batalhão",
    percentual: 88,
    subunidades: [
      { nome: "1ª Companhia", percentual: 85 },
      { nome: "2ª Companhia", percentual: 90 },
    ],
  },
  {
    id: 3,
    nome: "3º Batalhão",
    percentual: 95,
    subunidades: [
      { nome: "1ª Companhia", percentual: 97 },
      { nome: "2ª Companhia", percentual: 94 },
      { nome: "3ª Companhia", percentual: 95 },
    ],
  },
];

export default function DashboardGerente() {
  const { run, handleCallback, restart } = useGuidedTour("gerente");

  return (
    <DashboardLayout title="Painel do Comando" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <div className="mb-8 rounded-2xl bg-primary p-6" data-tour="efetivo-geral">
        <span className="text-xs font-medium text-white/70">Efetivo geral</span>
        <div className="mt-1 text-4xl font-semibold text-white">
          92% <span className="font-body text-base font-normal text-white/70">com exames em dia</span>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white p-4 text-sm text-text-muted">
        Este painel mostra apenas indicadores agregados por unidade — nunca dado clínico
        individual nominal (ver "Regras de Design" em agents/claude.md).
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Por unidade</h2>
      <div className="space-y-2" data-tour="por-unidade">
        {unidades.map((unidade) => (
          <Link
            key={unidade.id}
            to={`/gerente/unidade/${unidade.id}`}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
          >
            <span className="text-sm font-medium">{unidade.nome}</span>
            <span className="badge-normal rounded-full px-2 py-0.5 text-[11px] font-semibold">
              {unidade.percentual}% em dia
            </span>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
