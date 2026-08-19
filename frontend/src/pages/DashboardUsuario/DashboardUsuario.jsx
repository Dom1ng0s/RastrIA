import { LayoutDashboard, Plus } from "lucide-react";

import { DashboardLayout } from "../../components/DashboardLayout";

const navItems = [{ to: "/usuario", label: "Meu Histórico", icon: LayoutDashboard }];

// TODO: substituir por dados reais via TanStack Query (GET /api/registros-saude)
// quando o endpoint estiver pronto.
const registros = [
  { id: 1, indice: "Pressão arterial", valor: "12/8", data: "10 ago 2026", status: "normal" },
  { id: 2, indice: "Glicemia em jejum", valor: "112 mg/dL", data: "14 ago 2026", status: "atencao" },
  { id: 3, indice: "IMC", valor: "23.4", data: "14 ago 2026", status: "normal" },
];

const badgeClasse = { normal: "badge-normal", atencao: "badge-atencao", alterado: "badge-alterado" };
const badgeTexto = { normal: "Normal", atencao: "Atenção", alterado: "Alterado" };

export default function DashboardUsuario() {
  return (
    <DashboardLayout title="Meu Histórico" navItems={navItems}>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-text-muted">Seus exames e índices mais recentes.</p>
        {/* TODO: abrir formulário de cadastro (React Hook Form + Zod) quando essa tela existir */}
        <button className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
          <Plus size={16} /> Cadastrar exame
        </button>
      </div>

      <div className="space-y-3">
        {registros.map((registro) => (
          <div
            key={registro.id}
            className={`card-registro ${registro.status !== "normal" ? "atencao" : ""} rounded-xl bg-white p-4 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{registro.indice}</span>
              <span className={`${badgeClasse[registro.status]} rounded-full px-2 py-0.5 text-[11px] font-semibold`}>
                {badgeTexto[registro.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {registro.data} · {registro.valor}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
