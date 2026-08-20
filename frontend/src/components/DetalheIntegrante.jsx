import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

/**
 * Tela de detalhe de um integrante, reutilizada por médico (escopo="clinico")
 * e educador físico (escopo="fisico"). O escopo restringe quais registros
 * aparecem — ver "Regras de Design" em agents/claude.md sobre segregação
 * entre acompanhamento clínico e físico.
 */
export function DetalheIntegrante({ nome, voltarPara, navItems, tituloPagina, escopo }) {
  const registros = escopo === "clinico" ? REGISTROS_MOCK.clinico : REGISTROS_MOCK.fisico;

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
