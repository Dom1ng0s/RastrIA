import { useState } from "react";
import { ClipboardList, Download, FileText, LayoutDashboard, Stethoscope, Trophy } from "lucide-react";
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
    content: "Seu histórico é seu — baixe uma cópia completa em CSV a qualquer momento.",
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
// sobre seu dado, alinhado ao direito de portabilidade da LGPD.
function baixarHistoricoCsv(registros) {
  const cabecalho = "Índice,Valor,Data,Status\n";
  const linhas = registros
    .map((r) => `"${r.indice}","${r.valor}","${r.data}","${badgeTexto[r.status]}"`)
    .join("\n");
  const blob = new Blob([cabecalho + linhas], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "meu-historico-rastria.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function DashboardUsuario() {
  const { showToast } = useToast();
  const [registros] = useState(registrosIniciais);
  const { run, handleCallback, restart } = useGuidedTour("usuario");

  return (
    <DashboardLayout title="Meu Histórico" navItems={navItems} onHelp={restart}>
      <GuidedTour run={run} steps={tourSteps} callback={handleCallback} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">Seus exames e índices mais recentes.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-tour="baixar-historico"
            onClick={() => {
              baixarHistoricoCsv(registros);
              showToast("Histórico baixado com sucesso");
            }}
            className="btn-outline flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <Download size={16} /> Baixar histórico
          </button>
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
              <span className="text-sm font-medium">{registro.indice}</span>
              <span className={`${badgeClasse[registro.status]} rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors`}>
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
