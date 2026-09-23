import { ArrowLeft, Building2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { EstadoErro } from "../../components/EstadoErro";
import { useHierarquiaStore } from "../../features/hierarquia/store";
import { useAgregadoInstituicao } from "../../features/instituicoes/queries";
import { navItems } from "../DashboardGerente/DashboardGerente";

// Estrutura da unidade vem do store editável pelo Gerente (issue #98); o
// indicador "% em dia" vem da camada de dados (issue #125) e é cruzado aqui
// pelo id — mesma divisão do Painel Agregado.
export default function TelaPorUnidade() {
  const { id } = useParams();
  const unidades = useHierarquiaStore((state) => state.unidades);
  const unidade = unidades.find((item) => String(item.id) === id);

  const agregado = useAgregadoInstituicao();
  const percentualBatalhao = agregado.data?.percentuais.batalhoes[id];
  const percentuaisSubunidades = agregado.data?.percentuais.subunidades ?? {};

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
          {agregado.isLoading ? (
            <span className="inline-block h-9 w-28 animate-pulse rounded-md bg-white/20" aria-label="Carregando" />
          ) : (
            <>
              {percentualBatalhao === undefined ? "—" : `${percentualBatalhao}%`}{" "}
              <span className="font-body text-base font-normal text-white/70">com exames em dia</span>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white p-4 text-sm text-text-muted">
        Indicadores agregados por subunidade — nunca resultados ou valores clínicos individuais.
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Por subunidade</h2>
      <div className="space-y-2">
        {agregado.isError && (
          <EstadoErro
            title="Não foi possível carregar os indicadores das subunidades"
            onRetry={agregado.refetch}
          />
        )}

        {!agregado.isError &&
          unidade.subunidades.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{sub.nome}</span>
              {agregado.isLoading ? (
                <span className="skeleton h-5 w-24 shrink-0 rounded-full" aria-label="Carregando" />
              ) : (
                <span className="shrink-0 badge-normal rounded-full px-2 py-0.5 text-xs font-semibold">
                  {percentuaisSubunidades[sub.id] === undefined
                    ? "Sem dado ainda"
                    : `${percentuaisSubunidades[sub.id]}% em dia`}
                </span>
              )}
            </div>
          ))}

        {unidade.subunidades.length === 0 && (
          <EmptyState icon={Building2} title="Nenhuma subunidade cadastrada para esta unidade" />
        )}
      </div>
    </DashboardLayout>
  );
}
