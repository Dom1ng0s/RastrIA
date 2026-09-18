import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

import { useAtendimentosRealizados } from "../features/atendimentos/queries";
import { DashboardLayout } from "./DashboardLayout";
import { EmptyState } from "./EmptyState";
import { EstadoErro } from "./EstadoErro";
import { SkeletonLista } from "./Skeleton";

/**
 * Reutilizado por médico (escopo="clinico") e educador físico (escopo="fisico"),
 * mesmo racional de segregação de acesso do DetalheIntegrante. `detalheBase` é o
 * prefixo da rota de detalhe do integrante ("/medico/paciente", "/educador-fisico/aluno"),
 * para saltar do log para o histórico completo da pessoa.
 */
export function AtendimentosRealizados({ navItems, tituloPagina, escopo, detalheBase }) {
  // Log do que já foi concluído — vem de features/atendimentos/queries.js
  // (issue #127). Diferente de "Meus pacientes"/"Meus alunos" no painel, que
  // mostra quem está sob acompanhamento agora (issue #79).
  const consulta = useAtendimentosRealizados(escopo);
  const atendimentos = consulta.data ?? [];

  return (
    <DashboardLayout title={tituloPagina} navItems={navItems}>
      <p className="mb-6 text-sm text-text-muted">
        Log dos atendimentos que você já concluiu. Diferente de "Meus pacientes"/"Meus alunos"
        no painel, que mostra quem está sob seu acompanhamento agora.
      </p>

      <div className="space-y-3">
        {consulta.isLoading && <SkeletonLista itens={2} variante="card" />}

        {consulta.isError && (
          <EstadoErro title="Não foi possível carregar seus atendimentos" onRetry={consulta.refetch} />
        )}

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

        {consulta.isSuccess && atendimentos.length === 0 && (
          <EmptyState icon={FileText} title="Nenhum atendimento realizado ainda" />
        )}
      </div>
    </DashboardLayout>
  );
}
