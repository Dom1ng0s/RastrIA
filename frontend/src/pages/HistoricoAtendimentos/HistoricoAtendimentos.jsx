import { FileText } from "lucide-react";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { EstadoErro } from "../../components/EstadoErro";
import { SkeletonLista } from "../../components/Skeleton";
import { useMeusAtendimentos } from "../../features/atendimentos/queries";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

// Histórico do que já foi atendido — vem de features/atendimentos/queries.js
// (issue #127). Diferente de SolicitarAcompanhamento, que mostra a solicitação
// pendente/em andamento.
export default function HistoricoAtendimentos() {
  const consulta = useMeusAtendimentos();
  const atendimentosRealizados = consulta.data ?? [];

  return (
    <DashboardLayout title="Meus Atendimentos" navItems={navItems}>
      <p className="mb-6 text-sm text-text-muted">
        Atendimentos já realizados com profissionais da sua instituição — complementa o seu
        histórico de exames em "Meu Histórico". Para solicitar um novo, acesse "Solicitar
        Acompanhamento" no menu lateral.
      </p>

      <div className="space-y-3">
        {consulta.isLoading && <SkeletonLista itens={2} variante="card" />}

        {consulta.isError && (
          <EstadoErro title="Não foi possível carregar seus atendimentos" onRetry={consulta.refetch} />
        )}

        {atendimentosRealizados.map((atendimento) => (
          <div key={atendimento.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              {/* <h2>: a tecla H do leitor de tela pula de um atendimento para o outro (issue #146). */}
              <h2 className="min-w-0 flex-1 truncate text-sm font-medium">{atendimento.profissional}</h2>
              <span className="shrink-0 text-xs text-text-muted">{atendimento.data}</span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">{atendimento.especialidade}</p>
            <p className="mt-2 text-sm text-text-dark">{atendimento.resumo}</p>
          </div>
        ))}

        {consulta.isSuccess && atendimentosRealizados.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Você ainda não teve nenhum atendimento"
            description='Solicite acompanhamento a um profissional em "Solicitar Acompanhamento".'
            actionLabel="Solicitar acompanhamento"
            actionTo="/usuario/solicitar"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
