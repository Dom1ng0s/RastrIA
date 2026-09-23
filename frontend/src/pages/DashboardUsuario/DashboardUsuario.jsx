import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Paperclip,
  Pencil,
  Stethoscope,
  Trash2,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

import { CadastrarExameModal } from "../../components/CadastrarExameModal";
import { ConfirmarAlteradoModal } from "../../components/ConfirmarAlteradoModal";
import { DashboardLayout } from "../../components/DashboardLayout";
import { DemoToggle } from "../../components/DemoToggle";
import { EmptyState } from "../../components/EmptyState";
import { EstadoErro } from "../../components/EstadoErro";
import { Skeleton, SkeletonLista } from "../../components/Skeleton";
import {
  useEditarRegistro,
  useExcluirRegistro,
  useRegistrosSaude,
  useUltimoTaf,
} from "../../features/saude/queries";
import { useToast } from "../../features/ui/ToastProvider";
import { dataFormularioParaExibicao } from "../../lib/dataRegistro";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";

export const navItems = [
  { to: "/usuario", label: "Meu Histórico", icon: LayoutDashboard, tour: "nav-historico" },
  {
    to: "/usuario/cadastrar-informacoes",
    label: "Cadastrar Informações",
    icon: ClipboardList,
    tour: "nav-cadastrar",
  },
  { to: "/usuario/solicitar", label: "Solicitar Acompanhamento", icon: Stethoscope, tour: "nav-solicitar" },
  { to: "/usuario/atendimentos", label: "Meus Atendimentos", icon: FileText, tour: "nav-atendimentos" },
  { to: "/usuario/ranking", label: "Ranking", icon: Trophy, tour: "nav-ranking" },
];

const tourSteps = [
  {
    target: "[data-tour='nav-historico']",
    title: "Meu Histórico",
    content: "Aqui ficam seus exames, índices e o resultado do seu último TAF, sempre com o status mais recente.",
    disableBeacon: true,
  },
  {
    target: "[data-tour='cadastrar-informacoes']",
    title: "Cadastrar informações",
    content: "Use este botão para registrar um novo exame ou exercício físico.",
  },
  {
    target: "[data-tour='ultimo-taf']",
    title: "Meu último TAF",
    content: "O resultado do seu Teste de Aptidão Física, cadastrado pelo educador físico responsável.",
  },
  {
    target: "[data-tour='nav-solicitar']",
    title: "Solicitar Acompanhamento",
    content: "Peça acompanhamento a um médico ou educador físico da sua instituição.",
  },
  {
    target: "[data-tour='nav-ranking']",
    title: "Ranking",
    content: "Veja como está seu desempenho físico em relação aos colegas da sua instituição.",
  },
  {
    target: "[data-tour='nav-configuracoes']",
    title: "Configurações",
    content:
      "Edite seu perfil, ajuste a acessibilidade e baixe uma cópia completa do seu histórico em CSV ou PDF (em Meus dados).",
  },
];

// Registros e TAF vêm de features/saude/queries.js (issue #127).
const badgeClasse = { normal: "badge-normal", atencao: "badge-atencao", alterado: "badge-alterado" };
const badgeTexto = { normal: "Normal", atencao: "Atenção", alterado: "Alterado" };

// TAF só é cadastrado por um educador físico (issue #7, ver agents/claude.md) — o
// usuário só visualiza o próprio último resultado, sem nenhuma ação de edição aqui.
const resultadoTafClasse = { apto: "badge-normal", inapto: "badge-alterado" };
const resultadoTafTexto = { apto: "Apto", inapto: "Inapto" };

// O botão "Baixar histórico" foi movido para Configurações → Meus dados
// (issue #88), sob a ótica de LGPD/portabilidade — ver components/BaixarHistoricoMenu.jsx.

// Resumo rápido derivado só do que já está carregado na tela (registros + TAF),
// sem novo dado da API — issue #94. Uma pendência é um índice em "atenção"/
// "alterado" ou um TAF "inapto".
function resumirSituacao(registros, taf) {
  const indicesPendentes = registros.filter((registro) => registro.status !== "normal");
  const tafInapto = taf.resultado === "inapto";
  const rotulos = [...indicesPendentes.map((registro) => registro.indice), ...(tafInapto ? ["TAF"] : [])];
  return { total: rotulos.length, rotulos };
}

export default function DashboardUsuario() {
  // Modo demo (issue #80) — ver components/DemoToggle.jsx. Alterna entre os
  // mocks normais e listas vazias, só para poder demonstrar/testar visualmente
  // o estado de "conta nova sem nenhum registro ainda".
  const [contaNova, setContaNova] = useState(false);
  const { run, handleCallback, restart } = useGuidedTour();

  const consultaRegistros = useRegistrosSaude();
  const consultaTaf = useUltimoTaf();
  const registros = contaNova ? [] : consultaRegistros.data ?? [];
  const taf = contaNova ? null : consultaTaf.data;

  // O resumo só faz sentido quando as duas consultas resolveram — antes disso
  // "tudo em dia" seria uma afirmação sobre dado que ainda não chegou.
  const resumoPronto = consultaRegistros.isSuccess && consultaTaf.isSuccess;

  // Confirmação explícita ao visualizar um resultado "Alterado" (issue #97) —
  // um badge na lista não garante que a pessoa notou/entendeu a gravidade.
  // `confirmados` só vive nesta sessão (não persiste) — quando o backend
  // existir, isso deve virar parte do próprio registro (ex: `visualizadoEm`).
  const [registroAberto, setRegistroAberto] = useState(null);
  const [confirmados, setConfirmados] = useState(() => new Set());

  // Editar e excluir registros do próprio usuário (issue #130).
  const [registroEditando, setRegistroEditando] = useState(null);
  const editar = useEditarRegistro();
  const excluir = useExcluirRegistro();
  const { showToast } = useToast();

  function salvarEdicao(dados) {
    const id = registroEditando.id;
    editar.mutate(
      {
        id,
        dados: {
          indice: dados.tipo,
          valor: dados.valor,
          data: dataFormularioParaExibicao(dados.data),
          anexo: dados.anexo ?? undefined,
        },
      },
      {
        onSuccess: () => {
          // O que a pessoa confirmou ter visto (issue #97) foi o valor antigo;
          // editar o registro derruba essa confirmação.
          setConfirmados((atual) => {
            if (!atual.has(id)) return atual;
            const proximo = new Set(atual);
            proximo.delete(id);
            return proximo;
          });
          showToast("Registro atualizado");
        },
        onError: () => showToast("Não foi possível salvar as alterações"),
      },
    );
  }

  function excluirRegistro(registro) {
    if (!window.confirm(`Excluir o registro "${registro.indice}" de ${registro.data}?`)) return;
    excluir.mutate(
      { id: registro.id },
      {
        onSuccess: () => showToast("Registro excluído"),
        onError: () => showToast("Não foi possível excluir o registro"),
      },
    );
  }

  const { total: totalPendencias, rotulos: rotulosPendencias } = resumirSituacao(registros, taf ?? { resultado: "apto" });

  return (
    <DashboardLayout title="Meu Histórico" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <DemoToggle contaNova={contaNova} onToggle={() => setContaNova((atual) => !atual)} />

      {!resumoPronto && !contaNova ? (
        <Skeleton variante="card" className="mb-6" />
      ) : totalPendencias === 0 ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl badge-normal p-4">
          <CheckCircle2 size={20} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold">Tudo em dia</p>
            <p className="text-xs">Nenhum índice em atenção ou alterado.</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl badge-atencao p-4">
          <AlertTriangle size={20} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              {totalPendencias} {totalPendencias === 1 ? "pendência" : "pendências"}
            </p>
            <p className="text-xs">Vale revisar: {rotulosPendencias.join(", ")}.</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">Seus exames e índices mais recentes.</p>
        <div className="flex items-center gap-2">
          {/* Único ponto de entrada para cadastro é /usuario/cadastrar-informacoes (CadastroInformacoes),
              que oferece a escolha entre exame e exercício físico — evita ter dois fluxos
              concorrentes para a mesma ação. */}
          <Link
            to="/usuario/cadastrar-informacoes"
            data-tour="cadastrar-informacoes"
            className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <ClipboardList size={16} /> Cadastrar informações
          </Link>
        </div>
      </div>

      <section className="mb-8" data-tour="ultimo-taf">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Meu último TAF</h2>
        {consultaTaf.isLoading && !contaNova && <Skeleton variante="card" />}

        {consultaTaf.isError && (
          <EstadoErro title="Não foi possível carregar seu TAF" onRetry={consultaTaf.refetch} />
        )}

        {taf ? (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resultado</span>
              <span
                className={`${resultadoTafClasse[taf.resultado]} rounded-full px-2 py-0.5 text-xs font-semibold`}
              >
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
            <p className="mt-3 text-xs text-text-muted">
              Cadastrado pelo educador físico responsável — não pode ser editado por aqui.
            </p>
          </div>
        ) : (
          (consultaTaf.isSuccess || contaNova) && (
          <EmptyState
            icon={Trophy}
            title="Você ainda não fez nenhum TAF"
            description="O Teste de Aptidão Física é cadastrado pelo educador físico responsável da sua instituição."
          />
          )
        )}
      </section>

      <div className="space-y-3">
        {consultaRegistros.isLoading && !contaNova && <SkeletonLista itens={3} variante="card" />}

        {consultaRegistros.isError && (
          <EstadoErro title="Não foi possível carregar seus registros" onRetry={consultaRegistros.refetch} />
        )}

        {registros.map((registro) => {
          const ehAlterado = registro.status === "alterado";
          // Registro lançado por um profissional (médico, educador físico) não
          // é editável nem excluível pelo usuário — o dado pertence a quem o
          // lançou. Ver `origem` em features/saude/queries.js (issue #130).
          const ehDoUsuario = registro.origem === "usuario";
          const temAcoes = ehAlterado || registro.anexo || ehDoUsuario;

          return (
            <div
              key={registro.id}
              className={`card-registro ${registro.status !== "normal" ? "atencao" : ""} w-full rounded-xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{registro.indice}</span>
                <span className={`${badgeClasse[registro.status]} shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors`}>
                  {badgeTexto[registro.status]}
                  {ehAlterado && confirmados.has(registro.id) ? " · visto" : ""}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {registro.data} · {registro.valor}
              </p>
              {!ehDoUsuario && (
                <p className="mt-0.5 text-xs text-text-muted">
                  Lançado pelo profissional responsável — não pode ser editado por aqui.
                </p>
              )}

              {temAcoes && (
                <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-line pt-2">
                  {ehAlterado && (
                    <button
                      type="button"
                      onClick={() => setRegistroAberto(registro)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ver detalhes<span className="sr-only"> — {registro.indice} de {registro.data}</span>
                    </button>
                  )}
                  {registro.anexo && (
                    <>
                      <a
                        href={registro.anexo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary"
                      >
                        <Paperclip size={13} aria-hidden="true" /> Visualizar anexo
                        <span className="sr-only"> — {registro.indice} de {registro.data}</span>
                      </a>
                      <a
                        href={registro.anexo.url}
                        download={registro.anexo.nome}
                        className="text-xs font-medium text-text-muted hover:text-primary"
                      >
                        Baixar<span className="sr-only"> anexo — {registro.indice} de {registro.data}</span>
                      </a>
                    </>
                  )}
                  {ehDoUsuario && (
                    <>
                      <button
                        type="button"
                        onClick={() => setRegistroEditando(registro)}
                        className="ml-auto flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary"
                      >
                        <Pencil size={13} aria-hidden="true" /> Editar
                        <span className="sr-only"> — {registro.indice} de {registro.data}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => excluirRegistro(registro)}
                        disabled={excluir.isPending}
                        className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-coral-escuro disabled:opacity-60"
                      >
                        <Trash2 size={13} aria-hidden="true" /> Excluir
                        <span className="sr-only"> — {registro.indice} de {registro.data}</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {(consultaRegistros.isSuccess || contaNova) && registros.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="Você ainda não tem nenhum registro de saúde"
            description="Cadastre seu primeiro exame para começar a acompanhar seus índices."
            actionLabel="Cadastrar seu primeiro exame"
            actionTo="/usuario/cadastrar-informacoes"
          />
        )}
      </div>

      {registroEditando && (
        <CadastrarExameModal
          registro={registroEditando}
          onClose={() => setRegistroEditando(null)}
          onSalvar={salvarEdicao}
        />
      )}

      {registroAberto && (
        <ConfirmarAlteradoModal
          registro={registroAberto}
          confirmado={confirmados.has(registroAberto.id)}
          onConfirmar={() =>
            setConfirmados((atual) => new Set(atual).add(registroAberto.id))
          }
          onClose={() => setRegistroAberto(null)}
        />
      )}
    </DashboardLayout>
  );
}
