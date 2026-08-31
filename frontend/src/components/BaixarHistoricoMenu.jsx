import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useToast } from "../features/ui/ToastProvider";

// Menu "Baixar histórico" (CSV/PDF). Vive em Configurações → Meus dados
// (issue #88) — foi MOVIDO do DashboardUsuario para cá, sob a ótica de LGPD,
// não duplicado. Sem conta pessoal (login provisionado pela instituição),
// baixar o próprio histórico é o que garante ao usuário posse real do dado,
// alinhado ao direito de portabilidade da LGPD. A montagem/escape do arquivo
// (CSV com neutralização de injeção de fórmula, ou PDF) vive em
// lib/exportarHistorico.js.

const badgeTexto = { normal: "Normal", atencao: "Atenção", alterado: "Alterado" };
const resultadoTafTexto = { apto: "Apto", inapto: "Inapto" };

// TODO: substituir por dados reais via TanStack Query (GET /api/registros-saude
// e GET /api/taf/ultimo) quando os endpoints existirem — hoje o export cobre os
// mesmos registros mockados que o DashboardUsuario mostra. Quando a API existir,
// `montarDadosHistorico` deve montar as seções a partir da resposta completa,
// não de um mock local, para o arquivo ser de fato o histórico inteiro.
const registrosMock = [
  { id: 1, indice: "Pressão arterial", valor: "12/8", data: "10 ago 2026", status: "normal" },
  { id: 2, indice: "Glicemia em jejum", valor: "112 mg/dL", data: "14 ago 2026", status: "atencao" },
  { id: 3, indice: "IMC", valor: "23.4", data: "14 ago 2026", status: "normal" },
];

const ultimoTafMock = {
  data: "12 ago 2026",
  corrida: "11min 30s",
  flexoes: 32,
  abdominais: 40,
  barra: 6,
  resultado: "apto",
};

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

export function BaixarHistoricoMenu() {
  const { showToast } = useToast();
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    const aoClicarFora = (evento) => {
      if (ref.current && !ref.current.contains(evento.target)) setAberto(false);
    };
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const baixarComo = async (formato) => {
    setAberto(false);
    try {
      // import dinâmico: o jsPDF (e o resto do módulo) só entra no bundle quando
      // o usuário de fato baixa algo.
      const { baixarHistorico } = await import("../lib/exportarHistorico");
      baixarHistorico(montarDadosHistorico(registrosMock, ultimoTafMock), formato);
      showToast(`Histórico baixado em ${formato.toUpperCase()}`);
    } catch {
      showToast("Não foi possível gerar o arquivo", "erro");
    }
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="btn-outline flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
      >
        <Download size={16} /> Baixar histórico
        <ChevronDown size={14} className={`transition-transform ${aberto ? "rotate-180" : ""}`} />
      </button>
      {aberto && (
        <div
          role="menu"
          className="absolute left-0 z-10 mt-2 w-48 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg"
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
  );
}
