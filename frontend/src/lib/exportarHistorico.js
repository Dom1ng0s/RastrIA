import { format } from "date-fns";
import { jsPDF } from "jspdf";

// Exportação do histórico de saúde do próprio usuário, gerada no navegador (sem
// depender de endpoint de backend) — ver "Decisão de Arquitetura: Fim do
// Autocadastro" em agents/claude.md. É o que garante ao usuário posse real sobre
// o próprio dado, alinhado ao direito de portabilidade da LGPD.
//
// `dados` tem o formato:
//   { geradoEm: Date, secoes: [{ titulo, colunas: string[], linhas: string[][] }] }
// Cada seção vira um bloco no CSV e uma tabela no PDF, para que exames, TAF e
// (quando o backend expuser) desempenho físico saiam todos no mesmo arquivo.

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
const COR_TEXTO = [27, 44, 41];
const COR_MUTED = [91, 107, 103];
const COR_LINHA = [228, 228, 228];

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
