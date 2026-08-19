import { LayoutDashboard } from "lucide-react";

import { DashboardLayout } from "../../components/DashboardLayout";

const navItems = [{ to: "/gerente", label: "Painel Agregado", icon: LayoutDashboard }];

// TODO: substituir por dados reais via TanStack Query (GET /api/instituicoes/:id/agregado)
// quando o endpoint existir. Hierarquia multinível (Batalhão/Companhia/Pelotão) ainda
// depende de confirmação do piloto institucional — ver agents/claude.md.
const unidades = [
  { nome: "1º Batalhão", percentual: 94 },
  { nome: "2º Batalhão", percentual: 88 },
  { nome: "3º Batalhão", percentual: 95 },
];

export default function DashboardGerente() {
  return (
    <DashboardLayout title="Painel do Comando" navItems={navItems}>
      <div className="mb-8 rounded-2xl bg-primary p-6">
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
      <div className="space-y-2">
        {unidades.map((unidade) => (
          <div key={unidade.nome} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <span className="text-sm font-medium">{unidade.nome}</span>
            <span className="badge-normal rounded-full px-2 py-0.5 text-[11px] font-semibold">
              {unidade.percentual}% em dia
            </span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
