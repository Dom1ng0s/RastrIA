import { ArrowLeft, Building2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { navItems, unidades } from "../DashboardGerente/DashboardGerente";

export default function TelaPorUnidade() {
  const { id } = useParams();
  const unidade = unidades.find((item) => String(item.id) === id);

  if (!unidade) {
    return (
      <DashboardLayout title="Unidade" navItems={navItems}>
        <p className="text-sm text-text-muted">Unidade não encontrada.</p>
        <Link to="/gerente" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          <ArrowLeft size={16} /> Voltar ao Painel Agregado
        </Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={unidade.nome} navItems={navItems}>
      <Link to="/gerente" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="mb-8 rounded-2xl bg-primary p-6">
        <span className="text-xs font-medium text-white/70">Efetivo da unidade</span>
        <div className="mt-1 text-4xl font-semibold text-white">
          {unidade.percentual}% <span className="font-body text-base font-normal text-white/70">com exames em dia</span>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white p-4 text-sm text-text-muted">
        Indicadores agregados por subunidade — nunca dado clínico individual nominal (ver
        "Regras de Design" em agents/claude.md).
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Por subunidade</h2>
      <div className="space-y-2">
        {unidade.subunidades.map((sub) => (
          <div key={sub.nome} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{sub.nome}</span>
            <span className="shrink-0 badge-normal rounded-full px-2 py-0.5 text-[11px] font-semibold">
              {sub.percentual}% em dia
            </span>
          </div>
        ))}

        {unidade.subunidades.length === 0 && (
          <EmptyState icon={Building2} title="Nenhuma subunidade cadastrada para esta unidade" />
        )}
      </div>
    </DashboardLayout>
  );
}
