import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Download,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Stethoscope,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { GuidedTour } from "../../features/tour/GuidedTour";
import { useGuidedTour } from "../../features/tour/useGuidedTour";
import { useToast } from "../../features/ui/ToastProvider";

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
    target: "[data-tour='baixar-historico']",
    title: "Baixar histórico",
    content: "Seu histórico é seu — baixe uma cópia completa em CSV ou PDF a qualquer momento.",
  },
];

// TODO: substituir por dados reais via TanStack Query (GET /api/registros-saude)
// quando o endpoint estiver pronto.
const registrosIniciais = [
  { id: 1, indice: "Pressão arterial", valor: "12/8", data: "10 ago 2026", status: "normal" },
  { id: 2, indice: "Glicemia em jejum", valor: "112 mg/dL", data: "14 ago 2026", status: "atencao" },
  { id: 3, indice: "IMC", valor: "23.4", data: "14 ago 2026", status: "normal" },
];

const badgeClasse = { normal: "badge-normal", atencao: "badge-atencao", alterado: "badge-alterado" };
const badgeTexto = { normal: "Normal", atencao: "Atenção", alterado: "Alterado" };

// TAF só é cadastrado por um educador físico (issue #7, ver agents/claude.md) — o
// usuário só visualiza o próprio último resultado, sem nenhuma ação de edição aqui.
// TODO: substituir por dado real via TanStack Query (GET /api/taf/ultimo) quando o
// endpoint existir.
const ultimoTaf = {
  data: "12 ago 2026",
  corrida: "11min 30s",
  flexoes: 32,
  abdominais: 40,
  barra: 6,
  resultado: "apto",
};

const resultadoTafClasse = { apto: "badge-normal", inapto: "badge-alterado" };
const resultadoTafTexto = { apto: "Apto", inapto: "Inapto" };

// Sem conta pessoal (login provisionado pela instituição — ver DOCUMENTACAO.md,
// seção 16), baixar o próprio histórico é o que garante ao usuário posse real
// sobre seu dado, alinhado ao direito de portabilidade da LGPD. A montagem/escape
// do arquivo (CSV com neutralização de injeção de fórmula, ou PDF) vive em
// lib/exportarHistorico.js.
//
// TODO: hoje o export cobre os registros de saúde e o último TAF que a tela já
// tem em mão. Quando GET /api/registros-saude e o histórico de TAF/desempenho
// físico existirem, montar as seções a partir da resposta completa da API — não
// só do que está renderizado — para o arquivo ser de fato o histórico inteiro.
function montarDadosHistorico(registros, taf) {
  const secoes = [
    {
      titulo: "Exames e índices",
      colunas: ["Índice", "Valor", "Data", "Status"],
      linhas: registros.map((r) => [r.indice, r.valor, r.data, badgeTexto[r.status]]),
    },
  ];

  if (taf) {
    secoes.push({
      titulo: "Último TAF",
      colunas: ["Componente", "Resultado"],
      linhas: [
        ["Data", taf.data],
        ["Corrida", taf.corrida],
        ["Flexão", String(taf.flexoes)],
        ["Abdominal", String(taf.abdominais)],
        ["Barra", String(taf.barra)],
        ["Resultado", resultadoTafTexto[taf.resultado]],
      ],
    });
  }

  return { geradoEm: new Date(), secoes };
}

export default function DashboardUsuario() {
  const { showToast } = useToast();
  const [registros] = useState(registrosIniciais);
  const { run, handleCallback, restart } = useGuidedTour("usuario");
  const [menuExportarAberto, setMenuExportarAberto] = useState(false);
  const menuExportarRef = useRef(null);

  useEffect(() => {
    if (!menuExportarAberto) return undefined;
    const aoClicarFora = (evento) => {
      if (menuExportarRef.current && !menuExportarRef.current.contains(evento.target)) {
        setMenuExportarAberto(false);
      }
    };
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") setMenuExportarAberto(false);
    };
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [menuExportarAberto]);

  const baixarComo = async (formato) => {
    setMenuExportarAberto(false);
    try {
      // import dinâmico: o jsPDF (e o resto do módulo) só entra no bundle quando
      // o usuário de fato baixa algo, mantendo a carga inicial do dashboard leve.
      const { baixarHistorico } = await import("../../lib/exportarHistorico");
      baixarHistorico(montarDadosHistorico(registros, ultimoTaf), formato);
      showToast(`Histórico baixado em ${formato.toUpperCase()}`);
    } catch {
      showToast("Não foi possível gerar o arquivo", "erro");
    }
  };

  return (
    <DashboardLayout title="Meu Histórico" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">Seus exames e índices mais recentes.</p>
        <div className="flex items-center gap-2">
          <div className="relative" ref={menuExportarRef}>
            <button
              type="button"
              data-tour="baixar-historico"
              onClick={() => setMenuExportarAberto((aberto) => !aberto)}
              aria-haspopup="menu"
              aria-expanded={menuExportarAberto}
              className="btn-outline flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
            >
              <Download size={16} /> Baixar histórico
              <ChevronDown
                size={14}
                className={`transition-transform ${menuExportarAberto ? "rotate-180" : ""}`}
              />
            </button>
            {menuExportarAberto && (
              <div
                role="menu"
                className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => baixarComo("csv")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-dark hover:bg-bg-tint"
                >
                  <FileSpreadsheet size={15} /> Baixar em CSV
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => baixarComo("pdf")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-dark hover:bg-bg-tint"
                >
                  <FileText size={15} /> Baixar em PDF
                </button>
              </div>
            )}
          </div>
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
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Resultado</span>
            <span
              className={`${resultadoTafClasse[ultimoTaf.resultado]} rounded-full px-2 py-0.5 text-[11px] font-semibold`}
            >
              {resultadoTafTexto[ultimoTaf.resultado]}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-muted">{ultimoTaf.data}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-muted sm:grid-cols-4">
            <span>Corrida · {ultimoTaf.corrida}</span>
            <span>Flexão · {ultimoTaf.flexoes}</span>
            <span>Abdominal · {ultimoTaf.abdominais}</span>
            <span>Barra · {ultimoTaf.barra}</span>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Cadastrado pelo educador físico responsável — não pode ser editado por aqui.
          </p>
        </div>
      </section>

      <div className="space-y-3">
        {registros.map((registro) => (
          <div
            key={registro.id}
            className={`card-registro ${registro.status !== "normal" ? "atencao" : ""} rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{registro.indice}</span>
              <span className={`${badgeClasse[registro.status]} shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors`}>
                {badgeTexto[registro.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {registro.data} · {registro.valor}
            </p>
          </div>
        ))}

        {registros.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="Você ainda não tem nenhum registro de saúde"
            description="Cadastre seu primeiro exame para começar a acompanhar seus índices."
            actionLabel="Cadastrar seu primeiro exame"
            actionTo="/usuario/cadastrar-informacoes"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
