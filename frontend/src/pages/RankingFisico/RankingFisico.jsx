import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

import { CampoBusca } from "../../components/CampoBusca";
import { DashboardLayout } from "../../components/DashboardLayout";
import { DemoToggle } from "../../components/DemoToggle";
import { EmptyState } from "../../components/EmptyState";
import { useRankingPrefsStore } from "../../features/ranking/store";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

// TODO: substituir por dados reais via TanStack Query (GET /api/ranking?atividade=...)
// quando o endpoint existir. O ranking deve ser sempre restrito a integrantes da MESMA
// instituição/corporação do usuário logado (nunca cross-instituição) — ver "Instituicao"
// em agents/claude.md. Tempo de atividade física não é dado clínico, então esse ranking
// não é afetado pela regra de segregação de acesso do papel Gerente/Comando (essa regra
// é sobre índice de saúde, não desempenho físico entre pares).
const usuarioAtualId = 4;

const atividades = [
  { id: "corrida-5km", label: "Corrida · 5km" },
  { id: "corrida-10km", label: "Corrida · 10km" },
  { id: "natacao-500m", label: "Natação · 500m" },
  { id: "ciclismo-20km", label: "Ciclismo · 20km" },
];

// Fonte única de verdade de cada integrante: batalhão + companhia consistentes
// entre todas as atividades. O ranking referencia só `id` + `tempo`; nome e
// unidade vêm daqui. Antes cada linha carregava `unidade: "Nª Companhia"` solta,
// que não reconciliava com o filtro "meu batalhão" (issue #76). Hierarquia
// Batalhão > Companhia já é decisão de design assumida (ver "Instituicao").
const pessoas = {
  1: { nome: "Sgt. Almeida", batalhao: "1º Batalhão", companhia: "1ª Companhia" },
  2: { nome: "Cb. Ferreira", batalhao: "2º Batalhão", companhia: "1ª Companhia" },
  3: { nome: "Sd. Rocha", batalhao: "1º Batalhão", companhia: "2ª Companhia" },
  4: { nome: "Você", batalhao: "1º Batalhão", companhia: "2ª Companhia" },
  5: { nome: "Cb. Nunes", batalhao: "3º Batalhão", companhia: "1ª Companhia" },
  6: { nome: "Sd. Barros", batalhao: "2º Batalhão", companhia: "2ª Companhia" },
  7: { nome: "Sgt. Lima", batalhao: "3º Batalhão", companhia: "2ª Companhia" },
};

const rankingsPorAtividade = {
  "corrida-5km": [
    { id: 1, tempo: "21:04" },
    { id: 2, tempo: "21:47" },
    { id: 3, tempo: "22:12" },
    { id: 4, tempo: "22:58" },
    { id: 5, tempo: "23:20" },
    { id: 6, tempo: "24:05" },
    { id: 7, tempo: "24:41" },
  ],
  "corrida-10km": [
    { id: 2, tempo: "45:10" },
    { id: 3, tempo: "46:32" },
    { id: 1, tempo: "47:01" },
    { id: 6, tempo: "49:18" },
    { id: 4, tempo: "51:47" },
    { id: 5, tempo: "53:02" },
  ],
  "natacao-500m": [
    { id: 4, tempo: "9:12" },
    { id: 7, tempo: "9:30" },
    { id: 3, tempo: "9:58" },
    { id: 2, tempo: "10:21" },
  ],
  "ciclismo-20km": [
    { id: 5, tempo: "38:15" },
    { id: 1, tempo: "39:40" },
    { id: 4, tempo: "41:22" },
    { id: 6, tempo: "43:07" },
    { id: 3, tempo: "44:50" },
  ],
};

const escopos = [
  { id: "corporacao", label: "Toda a corporação" },
  { id: "batalhao", label: "Meu batalhão" },
];

const medalhaClasse = {
  1: "text-[#D4A017]",
  2: "text-[#8C8C8C]",
  3: "text-[#B0692A]",
};

export default function RankingFisico() {
  const [atividadeId, setAtividadeId] = useState(atividades[0].id);
  const [escopoId, setEscopoId] = useState(escopos[0].id);
  const [busca, setBusca] = useState("");
  // Modo demo (issue #80) — o ranking mockado nunca fica vazio sozinho
  // (sempre há tempos registrados), então este toggle simula "conta nova sem
  // nenhuma atividade registrada ainda" para poder demonstrar o estado vazio.
  const [contaNova, setContaNova] = useState(false);
  const optedOut = useRankingPrefsStore((state) => state.optedOut);

  const meuBatalhao = pessoas[usuarioAtualId].batalhao;

  const classificacao = useMemo(() => {
    if (contaNova) return [];
    const listaBase = rankingsPorAtividade[atividadeId];
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
  }, [atividadeId, escopoId, meuBatalhao, optedOut, contaNova]);

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
          value={atividadeId}
          onChange={(evento) => setAtividadeId(evento.target.value)}
          className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark sm:w-64"
        >
          {atividades.map((atividade) => (
            <option key={atividade.id} value={atividade.id}>
              {atividade.label}
            </option>
          ))}
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

      {escopoId === "batalhao" && (
        <p className="mb-4 -mt-2 text-xs text-text-muted">
          Mostrando só integrantes do <strong>{meuBatalhao}</strong>.
        </p>
      )}

      <div className="mb-6">
        <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar colega por nome..." />
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
            <span className="text-xs font-medium text-white/70">Sua posição</span>
            <div className="mt-1 text-4xl font-semibold text-white">
              {minhaPosicao.posicao}º{" "}
              <span className="font-body text-base font-normal text-white/70">
                lugar · {minhaPosicao.tempo} · {atividades.find((atividade) => atividade.id === atividadeId)?.label}
              </span>
            </div>
          </div>
        )
      )}

      <div className="space-y-2">
        {classificacaoFiltrada.map((entrada) => (
          <div
            key={entrada.id}
            className={`flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ${
              entrada.id === usuarioAtualId ? "border-l-4 border-seafoam" : ""
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

        {classificacao.length === 0 && (
          <EmptyState
            icon={Trophy}
            title="Nenhum resultado registrado nesse escopo ainda"
            description="Assim que colegas da sua instituição registrarem tempos nessa atividade, o ranking aparece aqui."
          />
        )}

        {classificacao.length > 0 && classificacaoFiltrada.length === 0 && (
          <EmptyState icon={Trophy} title="Nenhum colega encontrado com esse nome, nesse escopo" />
        )}
      </div>
    </DashboardLayout>
  );
}
