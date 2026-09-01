import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "./DashboardLayout";
import { EmptyState } from "./EmptyState";

// TODO: substituir por dado real via TanStack Query (GET /api/atendimentos?profissional=me)
// quando o endpoint existir. Diferente de "Meus pacientes"/"Meus alunos" (que mostra
// responsabilidade atual, no dashboard), esta tela é o log do que já foi efetivamente
// atendido — issue #79.
const ATENDIMENTOS_MOCK = {
  clinico: [
    { id: 1, pessoaId: 1, pessoa: "Bruno Alves", data: "10 ago 2026", resumo: "Avaliação de rotina — exames dentro da faixa esperada." },
    { id: 2, pessoaId: 2, pessoa: "Fernanda Dias", data: "05 ago 2026", resumo: "Acompanhamento de glicemia alterada, solicitado novo exame em 30 dias." },
  ],
  fisico: [
    { id: 3, pessoaId: 1, pessoa: "Diego Martins", data: "12 ago 2026", resumo: "Avaliação de condicionamento antes do TAF." },
  ],
};

/**
 * Reutilizado por médico (escopo="clinico") e educador físico (escopo="fisico"),
 * mesmo racional de segregação de acesso do DetalheIntegrante. `detalheBase` é o
 * prefixo da rota de detalhe do integrante ("/medico/paciente", "/educador-fisico/aluno"),
 * para saltar do log para o histórico completo da pessoa.
 */
export function AtendimentosRealizados({ navItems, tituloPagina, escopo, detalheBase }) {
  const atendimentos = escopo === "clinico" ? ATENDIMENTOS_MOCK.clinico : ATENDIMENTOS_MOCK.fisico;

  return (
    <DashboardLayout title={tituloPagina} navItems={navItems}>
      <p className="mb-6 text-sm text-text-muted">
        Log dos atendimentos que você já concluiu. Diferente de "Meus pacientes"/"Meus alunos"
        no painel, que mostra quem está sob seu acompanhamento agora.
      </p>

      <div className="space-y-3">
        {atendimentos.map((atendimento) => (
          <div key={atendimento.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <Link
                to={`${detalheBase}/${atendimento.pessoaId}`}
                className="min-w-0 flex-1 truncate text-sm font-medium text-primary hover:underline"
              >
                {atendimento.pessoa}
              </Link>
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
