import { useEffect, useRef, useState } from "react";
import { Stethoscope, Dumbbell, Check, Clock } from "lucide-react";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { EstadoErro } from "../../components/EstadoErro";
import { SkeletonLista } from "../../components/Skeleton";
import { useProfissionaisDisponiveis } from "../../features/atendimentos/queries";
import { useAuthStore } from "../../features/auth/store";
import { useNomeInstituicao } from "../../features/instituicoes/queries";
import { useToast } from "../../features/ui/ToastProvider";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

// Profissionais e nome da instituição vêm da camada de dados (issue #127).
// O recorte por instituição está no próprio hook: desde 24/08/2026 não existe
// mais rede pré-qualificada entre instituições (ver "Fim da Rede
// Pré-Qualificada Entre Instituições" em agents/claude.md). O backend precisa
// aplicar esse filtro no endpoint, não só aqui.
// Enquanto não há backend, o profissional "confirma" a solicitação sozinho
// depois de alguns segundos — só para o fluxo solicitação → confirmação →
// vínculo contínuo (o que diferencia o modelo do matching instantâneo,
// Parecer CFM nº 15/2026) ser demonstrável na tela. Ver issue #75.
const MS_ATE_CONFIRMACAO_SIMULADA = 4000;

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
  // TODO: vínculo de cuidado ativo viria da API (GET /api/vinculos-cuidado/meu),
  // já escopado à mesma instituição do usuário. Aqui começa null e é preenchido
  // quando a solicitação pendente é "confirmada" pelo profissional (simulado).
  const [vinculoAtivo, setVinculoAtivo] = useState(null);
  const [solicitacaoPendente, setSolicitacaoPendente] = useState(null);
  const timerConfirmacao = useRef(null);

  const consultaProfissionais = useProfissionaisDisponiveis(instituicaoId);
  const nomeInstituicao = useNomeInstituicao(instituicaoId);

  const profissionaisFiltrados = (consultaProfissionais.data ?? []).filter(
    (p) => p.tipo === tipoSelecionado,
  );

  function limparTimer() {
    if (timerConfirmacao.current) {
      clearTimeout(timerConfirmacao.current);
      timerConfirmacao.current = null;
    }
  }

  // Limpa o timer de confirmação simulada se a pessoa sair da tela antes dele.
  useEffect(() => limparTimer, []);

  function solicitar(profissional) {
    // TODO: chamar useSolicitarAtendimento() (POST /api/atendimentos/solicitar)
    // quando o endpoint existir. O backend deve validar que o profissional
    // pertence à mesma instituição do usuário antes de criar a solicitação —
    // essa regra não pode depender só do filtro do frontend. Por ora, simula
    // localmente a criação da solicitação, a confirmação do profissional e o
    // vínculo de cuidado contínuo resultante.
    limparTimer();
    setSolicitacaoPendente(profissional);
    showToast(`Solicitação enviada para ${profissional.nome}`);
    timerConfirmacao.current = setTimeout(() => {
      setSolicitacaoPendente(null);
      setVinculoAtivo(profissional);
      timerConfirmacao.current = null;
      showToast(`${profissional.nome} confirmou seu acompanhamento`);
    }, MS_ATE_CONFIRMACAO_SIMULADA);
  }

  function cancelarSolicitacao() {
    limparTimer();
    setSolicitacaoPendente(null);
    showToast("Solicitação cancelada");
  }

  function encerrarVinculo() {
    setVinculoAtivo(null);
    showToast("Acompanhamento encerrado");
  }

  return (
    <DashboardLayout title="Solicitar Acompanhamento" navItems={navItems}>
      {/* Vínculo de cuidado já ativo — próxima solicitação vai direto para o mesmo profissional */}
      {vinculoAtivo && !solicitacaoPendente && (
        <div className="mb-6 rounded-xl border border-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-medium text-text-muted">Seu acompanhamento contínuo</h2>
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
          <button
            type="button"
            onClick={encerrarVinculo}
            className="mt-3 text-xs font-medium text-text-muted underline hover:text-primary"
          >
            Encerrar acompanhamento
          </button>
        </div>
      )}

      {/* Confirmação de solicitação enviada */}
      {solicitacaoPendente && (
        <div className="mb-6 rounded-xl border border-line bg-white p-4">
          <h2 className="sr-only">Solicitação em andamento</h2>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full badge-atencao">
              <Clock size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                Solicitação enviada para <strong>{solicitacaoPendente.nome}</strong>
              </p>
              <span className="text-xs text-text-muted">Aguardando confirmação do profissional.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={cancelarSolicitacao}
            className="btn-outline mt-3 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Cancelar solicitação
          </button>
        </div>
      )}

      {!solicitacaoPendente && (
        <>
          {/* Títulos só para leitor de tela onde o design não tem título visível
              (issue #146): a navegação por títulos (tecla H) acha cada bloco. */}
          <h2 className="sr-only">Nova solicitação</h2>
          <p className="mb-1 text-sm text-text-muted">
            Escolha o tipo de acompanhamento. Se você já tiver um profissional vinculado para esse
            cuidado, a solicitação vai direto para ele.
          </p>
          <p className="mb-6 text-xs text-text-muted">
            Mostrando profissionais de <strong>{nomeInstituicao.data ?? "sua instituição"}</strong> — não existe
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
            {consultaProfissionais.isLoading && <SkeletonLista itens={2} />}

            {consultaProfissionais.isError && (
              <EstadoErro
                title="Não foi possível carregar os profissionais"
                onRetry={consultaProfissionais.refetch}
              />
            )}

            {profissionaisFiltrados.map((profissional) => (
              <div
                key={profissional.id}
                className="flex items-center justify-between rounded-xl border border-line bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{profissional.nome}</p>
                  <span className="block truncate text-xs text-text-muted">{profissional.especialidade}</span>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-seafoam-escuro">
                    <Check size={12} className="shrink-0" />
                    <span className="truncate">Disponível — {profissional.disponibilidade}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => solicitar(profissional)}
                  className="btn-outline shrink-0 rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  Solicitar<span className="sr-only"> acompanhamento com {profissional.nome}</span>
                </button>
              </div>
            ))}

            {consultaProfissionais.isSuccess && profissionaisFiltrados.length === 0 && (
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
