import { useState } from "react";
import { ClipboardList, Download, LayoutDashboard, Stethoscope, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "../../components/DashboardLayout";
import { useToast } from "../../features/ui/ToastProvider";

export const navItems = [
  { to: "/usuario", label: "Meu Histórico", icon: LayoutDashboard },
  { to: "/usuario/cadastrar-informacoes", label: "Cadastrar Informações", icon: ClipboardList },
  { to: "/usuario/solicitar", label: "Solicitar Acompanhamento", icon: Stethoscope },
  { to: "/usuario/ranking", label: "Ranking", icon: Trophy },
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

  return (
    <DashboardLayout title="Meu Histórico" navItems={navItems}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">Seus exames e índices mais recentes.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
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
            className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <ClipboardList size={16} /> Cadastrar informações
          </Link>
        </div>
      </div>

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
      </div>
    </DashboardLayout>
  );
}
