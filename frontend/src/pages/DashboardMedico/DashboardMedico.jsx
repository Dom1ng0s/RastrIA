import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";

const navItems = [{ to: "/medico", label: "Painel do Médico", icon: LayoutDashboard }];

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
  return (
    <DashboardLayout title="Painel do Médico" navItems={navItems}>
      <section className="mb-10">
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

      <section>
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
