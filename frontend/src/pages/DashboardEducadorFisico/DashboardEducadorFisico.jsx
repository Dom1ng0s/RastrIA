import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";

const navItems = [{ to: "/educador-fisico", label: "Painel do Educador Físico", icon: LayoutDashboard }];

// TODO: substituir por dados reais via TanStack Query quando os endpoints existirem.
const solicitacoes = [{ id: 1, usuario: "Diego Martins", data: "18 ago 2026" }];

const alunos = [
  { id: 1, nome: "Diego Martins", ultimaAvaliacao: "12 ago 2026" },
  { id: 2, nome: "Juliana Prado", ultimaAvaliacao: "08 ago 2026" },
];

export default function DashboardEducadorFisico() {
  return (
    <DashboardLayout title="Painel do Educador Físico" navItems={navItems}>
      <p className="mb-6 text-sm text-text-muted">
        Escopo restrito a desempenho físico — sem acesso a dado clínico (ver "Regras de Design"
        em agents/claude.md).
      </p>

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
              <p className="text-sm font-medium">{solicitacao.usuario}</p>
              <div className="flex gap-2">
                <button className="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold">Confirmar</button>
                <button className="btn-outline rounded-lg px-3 py-1.5 text-xs font-semibold">Recusar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Meus alunos</h2>
        <div className="space-y-2">
          {alunos.map((aluno) => (
            <Link
              key={aluno.id}
              to={`/educador-fisico/aluno/${aluno.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
            >
              <span className="text-sm font-medium">{aluno.nome}</span>
              <span className="text-xs text-text-muted">Última avaliação · {aluno.ultimaAvaliacao}</span>
            </Link>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}
