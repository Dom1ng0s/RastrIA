import { AlertTriangle, LayoutDashboard, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { useHierarquiaStore } from "../../features/hierarquia/store";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";

export const navItems = [
  { to: "/gerente", label: "Painel Agregado", icon: LayoutDashboard, tour: "nav-agregado" },
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

// Issue #11: exceção deliberada à regra "gerente nunca vê dado individual
// nominal" (ver "Regras de Design" em agents/claude.md) — o que aparece aqui é
// só o STATUS ADMINISTRATIVO de pendência (nome + tipo de exame + atraso),
// nunca o resultado/valor clínico do exame. Distinção confirmada com o time
// em 25/08/2026: análogo a um sistema de RH mostrar "treinamento vencido",
// não o conteúdo do treinamento.
// TODO: substituir por dado real via TanStack Query (GET /api/registros-saude?atrasados=)
// quando o endpoint existir.
const examesAtrasados = [
  { id: 1, nome: "Sd. João Pereira", unidade: "1º Batalhão", exame: "Exame de sangue de rotina", diasAtraso: 12 },
  { id: 2, nome: "Cb. Ana Ramos", unidade: "2º Batalhão", exame: "Avaliação cardiológica anual", diasAtraso: 5 },
  { id: 3, nome: "Sd. Marcos Lima", unidade: "3º Batalhão", exame: "TAF", diasAtraso: 20 },
];

// Percentual agregado ("% com exames em dia") por unidade continua sendo
// mock — só o backend pode calcular isso de verdade. TODO: substituir por
// dado real via TanStack Query (GET /api/instituicoes/:id/agregado) quando o
// endpoint existir. A estrutura da hierarquia em si (quais batalhões/
// companhias existem) já não é mais fixa aqui — vem de
// features/hierarquia/store.js, editável pelo Gerente (issue #98).
export default function DashboardGerente() {
  const unidades = useHierarquiaStore((state) => state.unidades);
  const { run, handleCallback, restart } = useGuidedTour();

  return (
    <DashboardLayout title="Painel do Comando" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <div className="mb-8 rounded-2xl bg-primary p-6" data-tour="efetivo-geral">
        <span className="text-xs font-medium text-white/70">Efetivo geral</span>
        <div className="mt-1 text-4xl font-semibold text-white">
          92% <span className="font-body text-base font-normal text-white/70">com exames em dia</span>
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
          {examesAtrasados.map((entrada) => (
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
              <span className="shrink-0 badge-atencao rounded-full px-2 py-0.5 text-[11px] font-semibold">
                {entrada.diasAtraso} dias atrasado
              </span>
            </div>
          ))}

          {examesAtrasados.length === 0 && (
            <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-text-muted">
              Nenhum exame atrasado no momento.
            </div>
          )}
        </div>
      </section>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Por unidade</h2>
      <div className="space-y-2" data-tour="por-unidade">
        {unidades.map((unidade) => (
          <Link
            key={unidade.id}
            to={`/gerente/unidade/${unidade.id}`}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:bg-bg-tint"
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{unidade.nome}</span>
            <span className="shrink-0 badge-normal rounded-full px-2 py-0.5 text-[11px] font-semibold">
              {unidade.percentual === null ? "Sem dado ainda" : `${unidade.percentual}% em dia`}
            </span>
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
