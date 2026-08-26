import { FileText } from "lucide-react";

import { DashboardLayout } from "./DashboardLayout";
import { EmptyState } from "./EmptyState";

// TODO: substituir por dado real via TanStack Query (GET /api/atendimentos?profissional=me)
// quando o endpoint existir. Diferente de "Meus pacientes"/"Meus alunos" (que mostra
// responsabilidade atual), esta tela é o log do que já foi efetivamente atendido —
// ver issue "histórico de atendimentos (usuário e profissional)".
const ATENDIMENTOS_MOCK = {
  clinico: [
    { id: 1, pessoa: "Bruno Alves", data: "10 ago 2026", resumo: "Avaliação de rotina — exames dentro da faixa esperada." },
    { id: 2, pessoa: "Fernanda Dias", data: "05 ago 2026", resumo: "Acompanhamento de glicemia alterada, solicitado novo exame em 30 dias." },
  ],
  fisico: [
    { id: 3, pessoa: "Diego Martins", data: "12 ago 2026", resumo: "Avaliação de condicionamento antes do TAF." },
  ],
};

/**
 * Reutilizado por médico (escopo="clinico") e educador físico (escopo="fisico"),
 * mesmo racional de segregação de acesso do DetalheIntegrante.
 */
export function AtendimentosRealizados({ navItems, tituloPagina, escopo }) {
  const atendimentos = escopo === "clinico" ? ATENDIMENTOS_MOCK.clinico : ATENDIMENTOS_MOCK.fisico;

  return (
    <DashboardLayout title={tituloPagina} navItems={navItems}>
      <p className="mb-6 text-sm text-text-muted">Atendimentos já realizados por você.</p>

      <div className="space-y-3">
        {atendimentos.map((atendimento) => (
          <div key={atendimento.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{atendimento.pessoa}</span>
              <span className="shrink-0 text-xs text-text-muted">{atendimento.data}</span>
            </div>
            <p className="mt-2 text-sm text-text-dark">{atendimento.resumo}</p>
          </div>
        ))}

        {atendimentos.length === 0 && (
          <EmptyState icon={FileText} title="Nenhum atendimento realizado ainda" />
        )}
      </div>
    </DashboardLayout>
  );
}
