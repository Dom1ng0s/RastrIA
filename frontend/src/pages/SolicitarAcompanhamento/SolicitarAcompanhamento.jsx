import { useState } from "react";
import { Stethoscope, Dumbbell, Check, Clock } from "lucide-react";

import { DashboardLayout } from "../../components/DashboardLayout";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

// TODO: substituir por dados reais via TanStack Query (GET /api/profissionais?tipo=)
// e pelo vínculo de cuidado ativo do usuário (GET /api/vinculos-cuidado/meu)
// quando os endpoints existirem. Ver stub em features/atendimentos/queries.js.
const profissionaisMock = [
  { id: 1, tipo: "medico", nome: "Dra. Camila Andrade", especialidade: "Clínica Geral", disponibilidade: "Hoje, a partir das 14h" },
  { id: 2, tipo: "medico", nome: "Dr. Ricardo Nunes", especialidade: "Cardiologia", disponibilidade: "Amanhã, a partir das 9h" },
  { id: 3, tipo: "educador_fisico", nome: "Felipe Souza", especialidade: "Educação Física — Condicionamento", disponibilidade: "Hoje, a partir das 16h" },
  { id: 4, tipo: "educador_fisico", nome: "Marina Alves", especialidade: "Educação Física — Reabilitação", disponibilidade: "Amanhã, a partir das 10h" },
];

const tipos = [
  { id: "medico", label: "Médico", icon: Stethoscope },
  { id: "educador_fisico", label: "Educador Físico", icon: Dumbbell },
];

export default function SolicitarAcompanhamento() {
  const [tipoSelecionado, setTipoSelecionado] = useState("medico");
  // TODO: vínculo de cuidado ativo viria da API — aqui simulado como null
  // (usuário ainda sem profissional vinculado) para ilustrar o fluxo completo.
  const [vinculoAtivo, setVinculoAtivo] = useState(null);
  const [solicitacaoPendente, setSolicitacaoPendente] = useState(null);

  const profissionaisFiltrados = profissionaisMock.filter((p) => p.tipo === tipoSelecionado);

  function solicitar(profissional) {
    // TODO: chamar useSolicitarAtendimento() (POST /api/atendimentos/solicitar)
    // quando o endpoint existir. Por ora, simula localmente a criação da
    // solicitação e o vínculo pendente de confirmação.
    setSolicitacaoPendente(profissional);
  }

  return (
    <DashboardLayout title="Solicitar Acompanhamento" navItems={navItems}>
      {/* Vínculo de cuidado já ativo — próxima solicitação vai direto para o mesmo profissional */}
      {vinculoAtivo && !solicitacaoPendente && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-line bg-white p-4">
          <div>
            <span className="text-xs font-medium text-text-muted">Seu acompanhamento contínuo</span>
            <p className="text-sm font-semibold text-primary">{vinculoAtivo.nome}</p>
            <span className="text-xs text-text-muted">{vinculoAtivo.especialidade}</span>
          </div>
          <button
            type="button"
            onClick={() => solicitar(vinculoAtivo)}
            className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Nova solicitação
          </button>
        </div>
      )}

      {/* Confirmação de solicitação enviada */}
      {solicitacaoPendente && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-line bg-white p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full badge-atencao">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-sm font-medium">
              Solicitação enviada para <strong>{solicitacaoPendente.nome}</strong>
            </p>
            <span className="text-xs text-text-muted">Aguardando confirmação do profissional.</span>
          </div>
        </div>
      )}

      {!solicitacaoPendente && (
        <>
          <p className="mb-6 text-sm text-text-muted">
            Escolha o tipo de acompanhamento. Se você já tiver um profissional vinculado para esse
            cuidado, a solicitação vai direto para ele.
          </p>

          <div className="mb-6 flex gap-2">
            {tipos.map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                onClick={() => setTipoSelecionado(tipo.id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  tipoSelecionado === tipo.id
                    ? "border-primary bg-bg-tint text-primary"
                    : "border-line text-text-dark hover:bg-bg-tint"
                }`}
              >
                <tipo.icon size={16} />
                {tipo.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {profissionaisFiltrados.map((profissional) => (
              <div
                key={profissional.id}
                className="flex items-center justify-between rounded-xl border border-line bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium">{profissional.nome}</p>
                  <span className="text-xs text-text-muted">{profissional.especialidade}</span>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-seafoam">
                    <Check size={12} />
                    Disponível — {profissional.disponibilidade}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => solicitar(profissional)}
                  className="btn-outline rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  Solicitar
                </button>
              </div>
            ))}

            {profissionaisFiltrados.length === 0 && (
              <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-text-muted">
                Nenhum profissional disponível nessa categoria no momento.
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}