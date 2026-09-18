import { ArrowLeft, ClipboardPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useRegistrosIntegrante, useTafIntegrante } from "../features/saude/queries";
import { DashboardLayout } from "./DashboardLayout";
import { EstadoErro } from "./EstadoErro";
import { Skeleton, SkeletonLista } from "./Skeleton";

const badgeClasse = { normal: "badge-normal", atencao: "badge-atencao", alterado: "badge-alterado" };
const badgeTexto = { normal: "Normal", atencao: "Atenção", alterado: "Alterado" };

const resultadoTafClasse = { apto: "badge-normal", inapto: "badge-alterado" };
const resultadoTafTexto = { apto: "Apto", inapto: "Inapto" };

/**
 * Tela de detalhe de um integrante, reutilizada por médico (escopo="clinico")
 * e educador físico (escopo="fisico"). O escopo restringe quais registros
 * aparecem — ver "Regras de Design" em agents/claude.md sobre segregação
 * entre acompanhamento clínico e físico.
 */
export function DetalheIntegrante({ nome, voltarPara, navItems, tituloPagina, escopo }) {
  const { id } = useParams();
  // Registros e TAF vêm de features/saude/queries.js (issue #127). O `escopo`
  // é o que garante, no backend, que um educador físico nunca receba dado
  // clínico — não é só regra de exibição aqui.
  const consultaRegistros = useRegistrosIntegrante(id, escopo);
  const consultaTaf = useTafIntegrante(id);
  const registros = consultaRegistros.data ?? [];
  const taf = consultaTaf.data;

  return (
    <DashboardLayout title={tituloPagina} navItems={navItems}>
      <Link to={voltarPara} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <h2 className="mb-6 text-xl font-semibold text-primary">{nome}</h2>

      {escopo === "fisico" && (
        <div className="mb-6 rounded-lg border border-line bg-white p-3 text-xs text-text-muted">
          Escopo restrito a desempenho físico — sem acesso a dado clínico.
        </div>
      )}

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">TAF</h3>
          {escopo === "fisico" && (
            <Link
              to={`/educador-fisico/aluno/${id}/taf`}
              className="btn-primary flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <ClipboardPlus size={14} /> Cadastrar TAF
            </Link>
          )}
        </div>

        {consultaTaf.isLoading && <Skeleton variante="card" />}

        {consultaTaf.isError && (
          <EstadoErro
            title="Não foi possível carregar o TAF"
            description={null}
            onRetry={consultaTaf.refetch}
          />
        )}

        {consultaTaf.isSuccess && taf ? (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Último resultado</span>
              <span className={`${resultadoTafClasse[taf.resultado]} rounded-full px-2 py-0.5 text-[11px] font-semibold`}>
                {resultadoTafTexto[taf.resultado]}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">{taf.data}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-muted sm:grid-cols-4">
              <span>Corrida · {taf.corrida}</span>
              <span>Flexão · {taf.flexoes}</span>
              <span>Abdominal · {taf.abdominais}</span>
              <span>Barra · {taf.barra}</span>
            </div>
            {escopo === "clinico" && (
              <p className="mt-3 text-xs text-text-muted">Cadastrado pelo educador físico responsável.</p>
            )}
          </div>
        ) : (
          consultaTaf.isSuccess && <p className="text-xs text-text-muted">Nenhum TAF cadastrado ainda.</p>
        )}
      </section>

      <div className="space-y-3">
        {consultaRegistros.isLoading && <SkeletonLista itens={2} variante="card" />}

        {consultaRegistros.isError && (
          <EstadoErro
            title="Não foi possível carregar os registros"
            onRetry={consultaRegistros.refetch}
          />
        )}

        {registros.map((registro) => (
          <div key={registro.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{registro.indice}</span>
              <span className={`${badgeClasse[registro.status]} shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold`}>
                {badgeTexto[registro.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {registro.data} · {registro.valor}
            </p>
          </div>
        ))}

        {consultaRegistros.isSuccess && registros.length === 0 && (
          <p className="py-6 text-center text-sm text-text-muted">Nenhum registro neste escopo ainda.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
