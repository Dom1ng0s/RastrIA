import { format } from "date-fns";
import { jsPDF } from "jspdf";

// Exportação do histórico de saúde do próprio usuário, gerada no navegador (sem
// depender de endpoint de backend) — ver "Decisão de Arquitetura: Fim do
// Autocadastro" em agents/claude.md. É o que garante ao usuário posse real sobre
// o próprio dado, alinhado ao direito de portabilidade da LGPD.
//
// `dados` tem o formato:
//   {
//     geradoEm: Date,
//     secoes: [{ titulo, colunas: string[], linhas: string[][] }],
//     graficos?: [{ titulo, unidade, pontos: [{ rotulo, valor: number }] }],
//   }
// Cada seção vira um bloco no CSV e uma tabela no PDF, para que exames, TAF e
// (quando o backend expuser) desempenho físico saiam todos no mesmo arquivo.
// `graficos` é opcional e só afeta o PDF: um gráfico de linha da evolução de
// cada índice ao longo do tempo (issue #90), desenhado em vetor pelo próprio
// jsPDF — sem lib de chart nem backend.

// Excel e Google Sheets interpretam uma célula que começa com = + - @ (ou TAB/CR)
// como fórmula — um valor vindo do usuário poderia virar injeção de fórmula ao
// abrir o arquivo. Prefixamos com aspa simples para neutralizar, e sempre
// envolvemos em aspas duplas (dobrando as internas) para conter vírgula/quebra.
export function escaparCelulaCsv(valor) {
  let texto = valor == null ? "" : String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) {
    texto = `'${texto}`;
  }
  return `"${texto.replace(/"/g, '""')}"`;
}

// Caractere U+FEFF (byte order mark) — invisível no editor, é intencional.
const BOM_UTF8 = "﻿";

export function gerarCsvHistorico(dados) {
  const linhas = [];
  dados.secoes.forEach((secao, i) => {
    if (i > 0) linhas.push("");
    linhas.push(escaparCelulaCsv(secao.titulo));
    linhas.push(secao.colunas.map(escaparCelulaCsv).join(","));
    secao.linhas.forEach((linha) => {
      linhas.push(linha.map(escaparCelulaCsv).join(","));
    });
  });
  // BOM para o Excel reconhecer o UTF-8 (acentos); CRLF conforme RFC 4180.
  return `${BOM_UTF8}${linhas.join("\r\n")}\r\n`;
}

const COR_PRIMARY = [12, 74, 68];
const COR_SEAFOAM = [20, 184, 146];
const COR_TEXTO = [27, 44, 41];
const COR_MUTED = [91, 107, 103];
const COR_LINHA = [228, 228, 228];

function formatarNumero(valor) {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

// Gráfico de linha da evolução de um índice, desenhado em vetor no PDF
// (issue #90). `area` em pontos: { x, y (topo da área de plot), largura, altura }.
function desenharGraficoEvolucao(doc, grafico, area) {
  const { x, y, largura, altura } = area;
  const padEsquerda = 42;
  const padBaixo = 14;
  const padTopo = 8; // espaço para o rótulo do valor máximo não encostar no título
  const plotX = x + padEsquerda;
  const plotY = y + padTopo;
  const plotLargura = largura - padEsquerda;
  const plotAltura = altura - padBaixo - padTopo;

  const valores = grafico.pontos.map((ponto) => ponto.valor);
  let minimo = Math.min(...valores);
  let maximo = Math.max(...valores);
  if (minimo === maximo) {
    minimo -= 1;
    maximo += 1;
  }
  const folga = (maximo - minimo) * 0.12;
  minimo -= folga;
  maximo += folga;

  const posX = (indice) =>
    grafico.pontos.length === 1
      ? plotX + plotLargura / 2
      : plotX + (plotLargura * indice) / (grafico.pontos.length - 1);
  const posY = (valor) => plotY + plotAltura - ((valor - minimo) / (maximo - minimo)) * plotAltura;

  // Título do gráfico
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COR_TEXTO);
  doc.text(`${grafico.titulo}${grafico.unidade ? ` (${grafico.unidade})` : ""}`, x, y - 5);

  // Linhas-guia horizontais + rótulos do eixo Y (mínimo, meio, máximo)
  doc.setFontSize(7);
  doc.setTextColor(...COR_MUTED);
  doc.setDrawColor(...COR_LINHA);
  for (let nivel = 0; nivel <= 2; nivel += 1) {
    const valor = minimo + ((maximo - minimo) * nivel) / 2;
    const linhaY = posY(valor);
    doc.line(plotX, linhaY, plotX + plotLargura, linhaY);
    doc.text(formatarNumero(valor), plotX - 5, linhaY + 2, { align: "right" });
  }

  // Série
  doc.setDrawColor(...COR_PRIMARY);
  doc.setLineWidth(1.4);
  for (let i = 1; i < grafico.pontos.length; i += 1) {
    doc.line(posX(i - 1), posY(valores[i - 1]), posX(i), posY(valores[i]));
  }
  doc.setLineWidth(1);

  // Pontos + rótulos do eixo X
  grafico.pontos.forEach((ponto, i) => {
    doc.setFillColor(...(i === grafico.pontos.length - 1 ? COR_SEAFOAM : COR_PRIMARY));
    doc.circle(posX(i), posY(ponto.valor), 2, "F");
    doc.setTextColor(...COR_MUTED);
    doc.setFontSize(7);
    doc.text(String(ponto.rotulo), posX(i), plotY + plotAltura + 10, { align: "center" });
  });
}

export function gerarPdfHistorico(dados) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const larguraPagina = doc.internal.pageSize.getWidth();
  const alturaPagina = doc.internal.pageSize.getHeight();
  const margem = 40;
  const larguraUtil = larguraPagina - margem * 2;
  let y = margem;

  const quebrarPaginaSePreciso = (altura) => {
    if (y + altura > alturaPagina - margem) {
      doc.addPage();
      y = margem;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COR_PRIMARY);
  doc.text("Meu histórico — Rastria", margem, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COR_MUTED);
  doc.text(`Gerado em ${format(dados.geradoEm, "dd/MM/yyyy 'às' HH:mm")}`, margem, y);
  y += 28;

  dados.secoes.forEach((secao) => {
    quebrarPaginaSePreciso(48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COR_TEXTO);
    doc.text(secao.titulo, margem, y);
    y += 14;

    const larguraCol = larguraUtil / secao.colunas.length;
    const padCel = 6;

    const desenharLinha = (celulas, negrito) => {
      const colunasQuebradas = celulas.map((celula) =>
        doc.splitTextToSize(celula == null ? "" : String(celula), larguraCol - padCel * 2),
      );
      const alturaLinha = Math.max(...colunasQuebradas.map((c) => c.length)) * 12 + 8;
      quebrarPaginaSePreciso(alturaLinha);
      doc.setFont("helvetica", negrito ? "bold" : "normal");
      doc.setFontSize(10);
      doc.setTextColor(...(negrito ? COR_TEXTO : COR_MUTED));
      colunasQuebradas.forEach((textoColuna, idx) => {
        doc.text(textoColuna, margem + idx * larguraCol + padCel, y + 12);
      });
      y += alturaLinha;
      doc.setDrawColor(...COR_LINHA);
      doc.line(margem, y, margem + larguraUtil, y);
    };

    doc.setDrawColor(...COR_LINHA);
    doc.line(margem, y, margem + larguraUtil, y);
    desenharLinha(secao.colunas, true);
    if (secao.linhas.length === 0) {
      desenharLinha(["Nenhum registro"], false);
    } else {
      secao.linhas.forEach((linha) => desenharLinha(linha, false));
    }
    y += 20;
  });

  const graficos = (dados.graficos ?? []).filter((grafico) => grafico.pontos.length >= 2);
  if (graficos.length > 0) {
    const alturaGrafico = 92;
    quebrarPaginaSePreciso(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COR_TEXTO);
    doc.text("Evolução", margem, y);
    y += 8;

    graficos.forEach((grafico) => {
      quebrarPaginaSePreciso(alturaGrafico + 30);
      y += 22;
      desenharGraficoEvolucao(doc, grafico, {
        x: margem,
        y,
        largura: larguraUtil,
        altura: alturaGrafico,
      });
      y += alturaGrafico + 12;
    });
    y += 8;
  }

  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COR_MUTED);
    doc.text("Rastria", margem, alturaPagina - 20);
    doc.text(`Página ${pagina} de ${totalPaginas}`, larguraPagina - margem, alturaPagina - 20, {
      align: "right",
    });
  }

  return doc.output("blob");
}

function baixarBlob(blob, nomeArquivo) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  // O anchor precisa estar no DOM: em navegadores baseados em Gecko (Firefox),
  // `.click()` num elemento desconectado do documento não dispara o download.
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revogar a URL só depois de o navegador ter iniciado o download — fazer isso
  // de forma síncrona logo após `.click()` corta o download de arquivos maiores.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// `formato`: "csv" | "pdf".
export function baixarHistorico(dados, formato) {
  if (formato === "pdf") {
    baixarBlob(gerarPdfHistorico(dados), "meu-historico-rastria.pdf");
    return;
  }
  const blob = new Blob([gerarCsvHistorico(dados)], { type: "text/csv;charset=utf-8;" });
  baixarBlob(blob, "meu-historico-rastria.csv");
}
