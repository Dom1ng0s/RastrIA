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
// e GET /api/taf/ultimo) quando os endpoints existirem — hoje o export cobre um
// histórico mockado (várias medições por índice ao longo do tempo, para o
// gráfico de evolução do PDF ter o que mostrar — issue #90). Quando a API
// existir, `montarDadosHistorico` deve montar as seções e os gráficos a partir
// da resposta completa, não deste mock local.
const historicoMock = [
  {
    indice: "Peso",
    unidade: "kg",
    medicoes: [
      { data: "05 mai 2026", valor: 82.4, status: "normal" },
      { data: "10 jun 2026", valor: 81.1, status: "normal" },
      { data: "12 jul 2026", valor: 80.3, status: "normal" },
      { data: "14 ago 2026", valor: 79.6, status: "normal" },
    ],
  },
  {
    indice: "Glicemia em jejum",
    unidade: "mg/dL",
    medicoes: [
      { data: "05 mai 2026", valor: 118, status: "atencao" },
      { data: "10 jun 2026", valor: 109, status: "normal" },
      { data: "12 jul 2026", valor: 104, status: "normal" },
      { data: "14 ago 2026", valor: 112, status: "atencao" },
    ],
  },
  {
    indice: "Pressão sistólica",
    unidade: "mmHg",
    medicoes: [
      { data: "05 mai 2026", valor: 134, status: "atencao" },
      { data: "10 jun 2026", valor: 128, status: "normal" },
      { data: "12 jul 2026", valor: 124, status: "normal" },
      { data: "14 ago 2026", valor: 121, status: "normal" },
    ],
  },
  {
    indice: "IMC",
    unidade: "",
    medicoes: [
      { data: "05 mai 2026", valor: 24.6, status: "normal" },
      { data: "10 jun 2026", valor: 24.2, status: "normal" },
      { data: "12 jul 2026", valor: 23.9, status: "normal" },
      { data: "14 ago 2026", valor: 23.4, status: "normal" },
    ],
  },
];

const ultimoTafMock = {
  data: "12 ago 2026",
  corrida: "11min 30s",
  flexoes: 32,
  abdominais: 40,
  barra: 6,
  resultado: "apto",
};

// Rótulo curto do eixo X do gráfico: "05 mai 2026" -> "mai/26".
function rotuloCurtoData(data) {
  const partes = data.split(" ");
  return partes.length === 3 ? `${partes[1]}/${partes[2].slice(-2)}` : data;
}

function montarDadosHistorico(historico, taf) {
  const linhasExames = historico.flatMap((item) =>
    item.medicoes.map((medicao) => [
      item.indice,
      `${medicao.valor}${item.unidade ? ` ${item.unidade}` : ""}`,
      medicao.data,
      badgeTexto[medicao.status],
    ]),
  );

  const secoes = [
    {
      titulo: "Exames e índices",
      colunas: ["Índice", "Valor", "Data", "Status"],
      linhas: linhasExames,
    },
  ];

  const graficos = historico
    .filter((item) => item.medicoes.length >= 2)
    .map((item) => ({
      titulo: item.indice,
      unidade: item.unidade,
      pontos: item.medicoes.map((medicao) => ({
        rotulo: rotuloCurtoData(medicao.data),
        valor: medicao.valor,
      })),
    }));

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

  return { geradoEm: new Date(), secoes, graficos };
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
      baixarHistorico(montarDadosHistorico(historicoMock, ultimoTafMock), formato);
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
