import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

import { CampoBusca } from "../../components/CampoBusca";
import { DashboardLayout } from "../../components/DashboardLayout";
import { DemoToggle } from "../../components/DemoToggle";
import { EmptyState } from "../../components/EmptyState";
import { EstadoErro } from "../../components/EstadoErro";
import { SkeletonLista } from "../../components/Skeleton";
import { useRankingFisico } from "../../features/ranking/queries";
import { useRankingPrefsStore } from "../../features/ranking/store";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

// Dados do ranking vêm de features/ranking/queries.js (issue #125) — antes
// eram mock inline aqui, duplicado com o do queries.js e já divergindo dele.
// O que fica nesta tela é só lógica de apresentação: escopo, busca, opt-out e
// cálculo de posição.
const escopos = [
  { id: "corporacao", label: "Toda a corporação" },
  { id: "batalhao", label: "Meu batalhão" },
];

const medalhaClasse = {
  1: "text-medalha-ouro",
  2: "text-medalha-prata",
  3: "text-medalha-bronze",
};

export default function RankingFisico() {
  // `null` até o usuário escolher: a lista de atividades só existe depois que a
  // query resolve, então a seleção efetiva cai na primeira atividade recebida.
  const [atividadeEscolhida, setAtividadeEscolhida] = useState(null);
  const [escopoId, setEscopoId] = useState(escopos[0].id);
  const [busca, setBusca] = useState("");
  // Modo demo (issue #80) — o ranking mockado nunca fica vazio sozinho
  // (sempre há tempos registrados), então este toggle simula "conta nova sem
  // nenhuma atividade registrada ainda" para poder demonstrar o estado vazio.
  const [contaNova, setContaNova] = useState(false);
  const optedOut = useRankingPrefsStore((state) => state.optedOut);

  const ranking = useRankingFisico();
  const { usuarioAtualId, atividades, pessoas, rankingsPorAtividade } = ranking.data ?? {};

  const atividadeId = atividadeEscolhida ?? atividades?.[0]?.id ?? null;
  const meuBatalhao = pessoas?.[usuarioAtualId]?.batalhao;

  const classificacao = useMemo(() => {
    if (contaNova || !ranking.isSuccess) return [];
    const listaBase = rankingsPorAtividade[atividadeId] ?? [];
    const listaNoEscopo =
      escopoId === "batalhao"
        ? listaBase.filter((entrada) => pessoas[entrada.id].batalhao === meuBatalhao)
        : listaBase;
    const listaVisivel = optedOut
      ? listaNoEscopo.filter((entrada) => entrada.id !== usuarioAtualId)
      : listaNoEscopo;

    return listaVisivel.map((entrada, index) => ({
      ...entrada,
      ...pessoas[entrada.id],
      posicao: index + 1,
    }));
  }, [
    ranking.isSuccess,
    rankingsPorAtividade,
    pessoas,
    usuarioAtualId,
    atividadeId,
    escopoId,
    meuBatalhao,
    optedOut,
    contaNova,
  ]);

  // Busca por nome é aplicada por cima da classificação já calculada — não
  // recalcula posição (a posição reflete o escopo escolhido, não a busca;
  // buscar não deveria fazer alguém "subir" de posição, só filtrar quem
  // aparece na tela).
  const classificacaoFiltrada = classificacao.filter((entrada) =>
    entrada.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const minhaPosicao = classificacao.find((entrada) => entrada.id === usuarioAtualId);

  return (
    <DashboardLayout title="Ranking" navItems={navItems}>
      <DemoToggle contaNova={contaNova} onToggle={() => setContaNova((atual) => !atual)} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">Compare seus tempos com outros integrantes da sua corporação.</p>
        <select
          value={atividadeId ?? ""}
          onChange={(evento) => setAtividadeEscolhida(evento.target.value)}
          disabled={!ranking.isSuccess}
          aria-label="Atividade"
          className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark disabled:opacity-60 sm:w-64"
        >
          {ranking.isSuccess ? (
            atividades.map((atividade) => (
              <option key={atividade.id} value={atividade.id}>
                {atividade.label}
              </option>
            ))
          ) : (
            <option value="">Carregando atividades...</option>
          )}
        </select>
      </div>

      <div className="mb-6 flex gap-2">
        {escopos.map((escopo) => (
          <button
            key={escopo.id}
            type="button"
            onClick={() => setEscopoId(escopo.id)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              escopoId === escopo.id
                ? "border-primary bg-bg-tint text-primary"
                : "border-line text-text-dark hover:bg-bg-tint"
            }`}
          >
            {escopo.label}
          </button>
        ))}
      </div>

      {escopoId === "batalhao" && meuBatalhao && (
        <p className="mb-4 -mt-2 text-xs text-text-muted">
          Mostrando só integrantes do <strong>{meuBatalhao}</strong>.
        </p>
      )}

      <div className="mb-6">
        <CampoBusca rotulo="Buscar colega no ranking" valor={busca} aoMudar={setBusca} totalResultados={classificacaoFiltrada.length} placeholder="Buscar colega por nome..." />
      </div>

      {optedOut ? (
        <div className="mb-8 rounded-2xl border border-line bg-white p-6 text-sm text-text-muted">
          Você optou por não aparecer no ranking. Você pode mudar isso a qualquer momento em{" "}
          <Link to="/perfil" className="font-medium text-primary underline">
            Perfil
          </Link>
          .
        </div>
      ) : (
        minhaPosicao && (
          <div className="mb-8 rounded-2xl bg-primary p-6">
            <h2 className="text-xs font-medium text-white/70">Sua posição</h2>
            <div className="mt-1 text-4xl font-semibold text-white">
              {minhaPosicao.posicao}º{" "}
              <span className="font-body text-base font-normal text-white/70">
                lugar · {minhaPosicao.tempo} · {atividades?.find((atividade) => atividade.id === atividadeId)?.label}
              </span>
            </div>
          </div>
        )
      )}

      {/* Só para leitor de tela: navegação por títulos (issue #146). */}
      <h2 className="sr-only">Classificação</h2>
      <div className="space-y-2">
        {ranking.isLoading && <SkeletonLista itens={5} />}

        {ranking.isError && (
          <EstadoErro title="Não foi possível carregar o ranking" onRetry={ranking.refetch} />
        )}

        {classificacaoFiltrada.map((entrada) => (
          <div
            key={entrada.id}
            className={`flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ${
              entrada.id === usuarioAtualId ? "border-l-4 border-seafoam-escuro" : ""
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex w-7 shrink-0 items-center justify-center text-sm font-semibold text-text-muted">
                {entrada.posicao <= 3 ? (
                  <Trophy size={18} className={medalhaClasse[entrada.posicao]} />
                ) : (
                  entrada.posicao
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entrada.nome}</p>
                <p className="truncate text-xs text-text-muted">
                  {entrada.batalhao} · {entrada.companhia}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-primary">{entrada.tempo}</span>
          </div>
        ))}

        {ranking.isSuccess && classificacao.length === 0 && (
          <EmptyState
            icon={Trophy}
            title="Nenhum resultado registrado nesse escopo ainda"
            description="Assim que colegas da sua instituição registrarem tempos nessa atividade, o ranking aparece aqui."
          />
        )}

        {ranking.isSuccess && classificacao.length > 0 && classificacaoFiltrada.length === 0 && (
          <EmptyState icon={Trophy} title="Nenhum colega encontrado com esse nome, nesse escopo" />
        )}
      </div>
    </DashboardLayout>
  );
}
