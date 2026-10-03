import { ChevronRight, FileText } from "lucide-react";
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
    <DashboardLayout title={tituloPagina} paginaAtual="Atendimentos realizados" navItems={navItems} tituloNoConteudo>
      <h1 className="mb-1 text-xl font-semibold text-primary">Atendimentos realizados</h1>
      <p className="mb-6 text-sm text-text-muted">
        Log dos atendimentos que você já concluiu. Diferente de &ldquo;Meus pacientes&rdquo;/&ldquo;Meus alunos&rdquo;
        no painel, que mostra quem está sob seu acompanhamento agora.
      </p>

      <div className="space-y-3">
        {consulta.isLoading && <SkeletonLista itens={2} variante="card" />}

        {consulta.isError && (
          <EstadoErro title="Não foi possível carregar seus atendimentos" onRetry={consulta.refetch} />
        )}

        {atendimentos.map((atendimento) => (
          // O card inteiro é o alvo (issues #169 e #172): o nome sozinho era um
          // alvo de 18px de altura, abaixo dos 24 do WCAG 2.5.8, e não parecia
          // clicável sem o mouse em cima. O <a> continua sendo só o nome — o
          // `after:inset-0` estende a área de clique sobre o card, sem mudar o
          // nome acessível nem a ordem de tabulação.
          <div
            key={atendimento.id}
            className="relative rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-bg-tint [&:has(a:focus-visible)]:outline [&:has(a:focus-visible)]:outline-[3px] [&:has(a:focus-visible)]:outline-offset-2 [&:has(a:focus-visible)]:outline-primary"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Nome como <h2>: a tecla H do leitor de tela pula de um
                  atendimento para o outro (issue #146). */}
              <h2 className="min-w-0 flex-1 truncate text-sm font-medium">
                <Link
                  to={`${detalheBase}/${atendimento.pessoaId}`}
                  className="text-primary underline decoration-primary/40 underline-offset-2 after:absolute after:inset-0 after:content-[''] hover:decoration-primary focus-visible:outline-none"
                >
                  {atendimento.pessoa}
                </Link>
              </h2>
              <span className="shrink-0 text-xs text-text-muted">{atendimento.data}</span>
              <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-text-muted" />
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
