import { ArrowLeft, ClipboardPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { DashboardLayout } from "./DashboardLayout";

const badgeClasse = { normal: "badge-normal", atencao: "badge-atencao", alterado: "badge-alterado" };
const badgeTexto = { normal: "Normal", atencao: "Atenção", alterado: "Alterado" };

// TODO: substituir por dado real via TanStack Query (GET /api/integrantes/:id/registros?escopo=)
// quando o endpoint existir. O parâmetro `escopo` é quem garante, no backend, que um
// educador físico nunca recebe dado clínico — não é só uma regra de exibição no frontend.
const REGISTROS_MOCK = {
  clinico: [
    { id: 1, indice: "Hemograma completo", valor: "dentro da faixa", data: "28 jul 2026", status: "normal" },
    { id: 2, indice: "Glicemia em jejum", valor: "112 mg/dL", data: "14 ago 2026", status: "atencao" },
  ],
  fisico: [
    { id: 3, indice: "Corrida 5km", valor: "27min 40s", data: "05 ago 2026", status: "normal" },
    { id: 4, indice: "IMC", valor: "23.4", data: "14 ago 2026", status: "normal" },
  ],
};

// TAF só é cadastrado por um educador físico (issue #7, ver agents/claude.md) — por
// isso mora à parte de REGISTROS_MOCK.fisico, com botão de cadastro condicionado ao
// escopo desta tela. O médico também enxerga o resultado (é dado de desempenho físico,
// não dado clínico restrito — acompanha o paciente para fins ocupacionais/PCMSO), mas
// só em modo leitura: o botão "Cadastrar TAF" só aparece para o educador físico.
const TAF_MOCK = {
  1: { data: "12 ago 2026", corrida: "11min 30s", flexoes: 32, abdominais: 40, barra: 6, resultado: "apto" },
  2: { data: "08 ago 2026", corrida: "12min 05s", flexoes: 25, abdominais: 35, barra: 3, resultado: "apto" },
};

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
  const registros = escopo === "clinico" ? REGISTROS_MOCK.clinico : REGISTROS_MOCK.fisico;
  const taf = TAF_MOCK[id];

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

        {taf ? (
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
          <p className="text-xs text-text-muted">Nenhum TAF cadastrado ainda.</p>
        )}
      </section>

      <div className="space-y-3">
        {registros.map((registro) => (
          <div key={registro.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{registro.indice}</span>
              <span className={`${badgeClasse[registro.status]} rounded-full px-2 py-0.5 text-[11px] font-semibold`}>
                {badgeTexto[registro.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {registro.data} · {registro.valor}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
