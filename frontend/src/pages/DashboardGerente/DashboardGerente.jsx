import { AlertTriangle, LayoutDashboard, Settings2, Upload } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EstadoErro } from "../../components/EstadoErro";
import { SkeletonLista } from "../../components/Skeleton";
import { useHierarquiaStore } from "../../features/hierarquia/store";
import { useAgregadoInstituicao, useExamesAtrasados } from "../../features/instituicoes/queries";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";

export const navItems = [
  { to: "/gerente", label: "Painel Agregado", icon: LayoutDashboard, tour: "nav-agregado" },
  { to: "/gerente/importar-integrantes", label: "Importar Integrantes", icon: Upload },
  { to: "/gerente/hierarquia", label: "Configurar Unidades", icon: Settings2 },
];

const tourSteps = [
  {
    target: "[data-tour='efetivo-geral']",
    title: "Efetivo geral",
    content:
      "Indicador agregado do percentual de exames em dia — este painel nunca mostra dado clínico individual nominal.",
    disableBeacon: true,
  },
  {
    target: "[data-tour='por-unidade']",
    title: "Por unidade",
    content: "Acompanhe o percentual em dia de cada batalhão e clique para ver o detalhamento por unidade.",
  },
  {
    target: "[data-tour='exames-atrasados']",
    title: "Exames atrasados",
    content:
      "Status administrativo de pendência (quem está atrasado e em qual tipo de exame) — nunca o resultado clínico do exame.",
  },
];

// Exames atrasados e percentuais agregados vêm de features/instituicoes/queries.js
// (issue #125) — antes eram mock inline aqui, duplicado com o do queries.js.
// A hierarquia em si (quais batalhões/companhias existem) continua vindo do
// store editável pelo Gerente (issue #98); esta tela só cruza os dois pelo id.
//
// Sobre o que aparece em "exames atrasados": exceção deliberada à regra
// "Comando nunca vê dado individual nominal" (ver "Regras de Design" em
// agents/claude.md, issue #11) — é só o STATUS ADMINISTRATIVO de pendência
// (nome + tipo de exame + atraso), nunca o resultado/valor clínico. Distinção
// confirmada com o time em 25/08/2026: análogo a um sistema de RH mostrar
// "treinamento vencido", não o conteúdo do treinamento.
export default function DashboardGerente() {
  const unidades = useHierarquiaStore((state) => state.unidades);
  const { run, handleCallback, restart } = useGuidedTour();

  const atrasados = useExamesAtrasados();
  const agregado = useAgregadoInstituicao();

  const examesAtrasados = atrasados.data ?? [];
  const percentuaisBatalhoes = agregado.data?.percentuais.batalhoes ?? {};

  return (
    <DashboardLayout title="Painel do Comando" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <div className="mb-8 rounded-2xl bg-primary p-6" data-tour="efetivo-geral">
        <span className="text-xs font-medium text-white/70">Efetivo geral</span>
        <div className="mt-1 text-4xl font-semibold text-white">
          {agregado.isLoading ? (
            <span className="inline-block h-9 w-28 animate-pulse rounded-md bg-white/20" aria-label="Carregando" />
          ) : (
            <>
              {agregado.isError ? "—" : `${agregado.data.efetivoGeral}%`}{" "}
              <span className="font-body text-base font-normal text-white/70">com exames em dia</span>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white p-4 text-sm text-text-muted">
        Este painel mostra apenas indicadores agregados por unidade e status administrativo de
        pendência — nunca resultados ou valores clínicos individuais.
      </div>

      <section className="mb-8" data-tour="exames-atrasados">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
          Exames administrativos atrasados
        </h2>
        <div className="space-y-2">
          {atrasados.isLoading && <SkeletonLista itens={3} />}

          {atrasados.isError && (
            <EstadoErro
              title="Não foi possível carregar as pendências"
              onRetry={atrasados.refetch}
            />
          )}

          {atrasados.isSuccess &&
            examesAtrasados.map((entrada) => (
            <div
              key={entrada.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full badge-atencao">
                  <AlertTriangle size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{entrada.nome}</p>
                  <p className="truncate text-xs text-text-muted">
                    {entrada.exame} · {entrada.unidade}
                  </p>
                </div>
              </div>
              <span className="shrink-0 badge-atencao rounded-full px-2 py-0.5 text-xs font-semibold">
                {entrada.diasAtraso} dias atrasado
              </span>
              </div>
            ))}

          {atrasados.isSuccess && examesAtrasados.length === 0 && (
            <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-text-muted">
              Nenhum exame atrasado no momento.
            </div>
          )}
        </div>
      </section>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Por unidade</h2>
      <div className="space-y-2" data-tour="por-unidade">
        {agregado.isError && (
          <EstadoErro
            title="Não foi possível carregar os indicadores por unidade"
            onRetry={agregado.refetch}
          />
        )}

        {/* A lista de unidades é local (store da hierarquia), então ela aparece
            mesmo enquanto o indicador carrega — só o número entra depois. */}
        {!agregado.isError &&
          unidades.map((unidade) => (
            <Link
              key={unidade.id}
              to={`/gerente/unidade/${unidade.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{unidade.nome}</span>
              {agregado.isLoading ? (
                <span className="skeleton h-5 w-24 shrink-0 rounded-full" aria-label="Carregando" />
              ) : (
                <span className="shrink-0 badge-normal rounded-full px-2 py-0.5 text-xs font-semibold">
                  {percentuaisBatalhoes[unidade.id] === undefined
                    ? "Sem dado ainda"
                    : `${percentuaisBatalhoes[unidade.id]}% em dia`}
                </span>
              )}
            </Link>
          ))}

        {unidades.length === 0 && (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-text-muted">
            Nenhuma unidade cadastrada ainda.{" "}
            <Link to="/gerente/hierarquia" className="font-medium text-primary underline">
              Configurar unidades
            </Link>
            .
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
