import { useState } from "react";
import { Stethoscope, Dumbbell, Check, Clock } from "lucide-react";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { useAuthStore } from "../../features/auth/store";
import { useToast } from "../../features/ui/ToastProvider";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

// TODO: substituir por dados reais via TanStack Query
// (GET /api/profissionais?tipo=&instituicao=) e pelo vínculo de cuidado ativo
// do usuário (GET /api/vinculos-cuidado/meu) quando os endpoints existirem.
// Ver stub em features/atendimentos/queries.js.
//
// `instituicaoId` simula o vínculo institucional de cada profissional — desde
// a decisão de 24/08/2026 (ver "Fim da Rede Pré-Qualificada Entre
// Instituições" em agents/claude.md), não existe mais uma rede compartilhada
// entre instituições diferentes. O backend deve aplicar esse filtro no
// próprio endpoint (?instituicao=), não só no frontend — o filtro aqui é só
// para a experiência da tela enquanto o endpoint real não existe.
const profissionaisMock = [
  { id: 1, tipo: "medico", nome: "Dra. Camila Andrade", especialidade: "Clínica Geral", disponibilidade: "Hoje, a partir das 14h", instituicaoId: 1 },
  { id: 2, tipo: "medico", nome: "Dr. Ricardo Nunes", especialidade: "Cardiologia", disponibilidade: "Amanhã, a partir das 9h", instituicaoId: 1 },
  { id: 3, tipo: "educador_fisico", nome: "Felipe Souza", especialidade: "Educação Física — Condicionamento", disponibilidade: "Hoje, a partir das 16h", instituicaoId: 1 },
  { id: 4, tipo: "educador_fisico", nome: "Marina Alves", especialidade: "Educação Física — Reabilitação", disponibilidade: "Amanhã, a partir das 10h", instituicaoId: 1 },
  // Profissionais de outra instituição — devem ficar de fora do filtro abaixo,
  // demonstrando que o fim da rede pré-qualificada está em vigor.
  { id: 5, tipo: "medico", nome: "Dr. Otávio Reis", especialidade: "Clínica Geral", disponibilidade: "Hoje, a partir das 11h", instituicaoId: 2 },
];

// TODO: substituir por GET /api/instituicoes/:id quando o endpoint existir.
const INSTITUICOES_MOCK = { 1: "Batalhão PMAL", 2: "Outra instituição" };

const tipos = [
  { id: "medico", label: "Médico", icon: Stethoscope },
  { id: "educador_fisico", label: "Educador Físico", icon: Dumbbell },
];

export default function SolicitarAcompanhamento() {
  const { showToast } = useToast();
  const usuario = useAuthStore((state) => state.usuario);
  // Fallback para instituição 1 quando não há usuário no store (ex: acesso
  // direto à rota sem passar pelo atalho de login) — só para não quebrar a
  // tela enquanto não há autenticação real. Ver features/auth/store.js.
  const instituicaoId = usuario?.instituicaoId ?? 1;

  const [tipoSelecionado, setTipoSelecionado] = useState("medico");
  // TODO: vínculo de cuidado ativo viria da API, já escopado à mesma
  // instituição do usuário — aqui simulado como null (usuário ainda sem
  // profissional vinculado) para ilustrar o fluxo completo.
  const [vinculoAtivo, setVinculoAtivo] = useState(null);
  const [solicitacaoPendente, setSolicitacaoPendente] = useState(null);

  const profissionaisFiltrados = profissionaisMock.filter(
    (p) => p.tipo === tipoSelecionado && p.instituicaoId === instituicaoId,
  );

  function solicitar(profissional) {
    // TODO: chamar useSolicitarAtendimento() (POST /api/atendimentos/solicitar)
    // quando o endpoint existir. O backend deve validar que o profissional
    // pertence à mesma instituição do usuário antes de criar a solicitação —
    // essa regra não pode depender só do filtro do frontend. Por ora, simula
    // localmente a criação da solicitação e o vínculo pendente de confirmação.
    setSolicitacaoPendente(profissional);
    showToast(`Solicitação enviada para ${profissional.nome}`);
  }

  return (
    <DashboardLayout title="Solicitar Acompanhamento" navItems={navItems}>
      {/* Vínculo de cuidado já ativo — próxima solicitação vai direto para o mesmo profissional */}
      {vinculoAtivo && !solicitacaoPendente && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-line bg-white p-4">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-text-muted">Seu acompanhamento contínuo</span>
            <p className="truncate text-sm font-semibold text-primary">{vinculoAtivo.nome}</p>
            <span className="truncate text-xs text-text-muted">{vinculoAtivo.especialidade}</span>
          </div>
          <button
            type="button"
            onClick={() => solicitar(vinculoAtivo)}
            className="btn-primary shrink-0 rounded-lg px-4 py-2 text-sm font-semibold"
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
          <p className="mb-1 text-sm text-text-muted">
            Escolha o tipo de acompanhamento. Se você já tiver um profissional vinculado para esse
            cuidado, a solicitação vai direto para ele.
          </p>
          <p className="mb-6 text-xs text-text-muted">
            Mostrando profissionais de <strong>{INSTITUICOES_MOCK[instituicaoId]}</strong> — não existe
            mais rede compartilhada entre instituições diferentes.
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
                className="flex items-center justify-between rounded-xl border border-line bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{profissional.nome}</p>
                  <span className="block truncate text-xs text-text-muted">{profissional.especialidade}</span>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-seafoam">
                    <Check size={12} className="shrink-0" />
                    <span className="truncate">Disponível — {profissional.disponibilidade}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => solicitar(profissional)}
                  className="btn-outline shrink-0 rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  Solicitar
                </button>
              </div>
            ))}

            {profissionaisFiltrados.length === 0 && (
              <EmptyState
                icon={tipoSelecionado === "medico" ? Stethoscope : Dumbbell}
                title="Nenhum profissional disponível nessa categoria"
                description="Sua instituição ainda não tem profissional cadastrado com essa especialidade."
              />
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
