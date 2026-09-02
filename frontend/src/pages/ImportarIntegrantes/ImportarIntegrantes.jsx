import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { DashboardLayout } from "../../components/DashboardLayout";
import { navItems } from "../DashboardGerente/DashboardGerente";
import { processarPlanilhaIntegrantes } from "../../features/importarIntegrantes/planilha";
import { useToast } from "../../features/ui/ToastProvider";
import { mascararCpf } from "../../lib/cpf";

const NOMES_COLUNA = {
  nomeCompleto: "Nome completo",
  cpf: "CPF",
  dataNascimento: "Data de nascimento",
  sexo: "Sexo",
  contato: "Telefone ou e-mail",
};

/**
 * Upload de planilha de integrantes com prévia (issue #17) — alternativa ao
 * Django admin para o fluxo recorrente de provisionamento (ver "Brainstorming:
 * Operação do Piloto" em agents/claude.md). Aceita .csv e .xlsx no seletor,
 * mas só .csv é de fato processado por enquanto (ver nota em
 * lib/parseCsv.js sobre a vulnerabilidade sem correção na lib xlsx/SheetJS
 * disponível no npm). Nunca importa direto — sempre mostra prévia com
 * validação linha a linha antes de confirmar.
 */
export default function ImportarIntegrantes() {
  const inputRef = useRef(null);
  const { showToast } = useToast();
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [erroArquivo, setErroArquivo] = useState("");
  const [colunasFaltando, setColunasFaltando] = useState([]);
  const [registros, setRegistros] = useState(null);
  const [importando, setImportando] = useState(false);
  const [importado, setImportado] = useState(null);

  function limparResultado() {
    setErroArquivo("");
    setColunasFaltando([]);
    setRegistros(null);
    setImportado(null);
  }

  function aoSelecionarArquivo(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    limparResultado();
    setNomeArquivo(arquivo.name);

    const ehXlsx =
      arquivo.name.toLowerCase().endsWith(".xlsx") ||
      arquivo.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (ehXlsx) {
      setErroArquivo(
        "Arquivos .xlsx ainda não são processados nesta versão — exporte a planilha como .csv (Arquivo → Salvar como → CSV) e envie de novo.",
      );
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const { colunasFaltando: faltando, registros: linhas } = processarPlanilhaIntegrantes(
        String(leitor.result ?? ""),
      );
      if (faltando.length > 0) {
        setColunasFaltando(faltando);
        return;
      }
      setRegistros(linhas);
    };
    leitor.onerror = () => setErroArquivo("Não foi possível ler o arquivo. Tente novamente.");
    leitor.readAsText(arquivo, "utf-8");
  }

  const validos = registros?.filter((registro) => registro.erros.length === 0) ?? [];
  const comErro = registros?.filter((registro) => registro.erros.length > 0) ?? [];

  async function confirmarImportacao() {
    setImportando(true);
    // TODO: substituir por mutation do TanStack Query (POST /api/instituicoes/:id/integrantes/importar,
    // enviando as linhas válidas). Cada conta criada deve gerar um TokenAtivacao e
    // disparar o link de primeiro acesso por SMS/WhatsApp ou e-mail institucional
    // (ver "Provisionamento inicial de contas" em agents/claude.md) — nunca a
    // senha temporária em texto puro.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setImportando(false);
    setImportado(validos.length);
    showToast(`${validos.length} conta(s) provisionada(s). Link de ativação será enviado a cada integrante.`);
  }

  return (
    <DashboardLayout title="Importar Integrantes" navItems={navItems}>
      <p className="mb-6 max-w-[640px] text-sm text-text-muted">
        Importe integrantes em lote a partir de uma planilha, como alternativa ao Django admin.
        Colunas esperadas: <strong>Nome completo</strong>, <strong>CPF</strong>,{" "}
        <strong>Data de nascimento</strong> (dd/mm/aaaa), <strong>Sexo</strong> (M/F) e{" "}
        <strong>Telefone ou e-mail</strong>. Nada é importado antes de você revisar a prévia e
        confirmar.
      </p>

      <div className="mb-6 max-w-[640px] rounded-2xl border border-dashed border-line bg-white p-6 text-center">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={aoSelecionarArquivo}
          className="sr-only"
          id="arquivo-planilha"
        />
        <label
          htmlFor="arquivo-planilha"
          className="btn-primary inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
        >
          <Upload size={16} /> Selecionar planilha (.csv ou .xlsx)
        </label>
        {nomeArquivo && <p className="mt-3 text-xs text-text-muted">Arquivo selecionado: {nomeArquivo}</p>}
      </div>

      {erroArquivo && (
        <div className="mb-6 flex max-w-[640px] items-start gap-2 rounded-xl badge-alterado p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>{erroArquivo}</span>
        </div>
      )}

      {colunasFaltando.length > 0 && (
        <div className="mb-6 flex max-w-[640px] items-start gap-2 rounded-xl badge-alterado p-4 text-sm">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>
            Coluna(s) não encontrada(s) no arquivo:{" "}
            {colunasFaltando.map((chave) => NOMES_COLUNA[chave]).join(", ")}. Confira o cabeçalho da
            planilha e envie de novo.
          </span>
        </div>
      )}

      {registros && (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <span className="badge-normal rounded-full px-3 py-1 text-xs font-semibold">
              {validos.length} pronto(s) para importar
            </span>
            {comErro.length > 0 && (
              <span className="badge-alterado rounded-full px-3 py-1 text-xs font-semibold">
                {comErro.length} com erro (não serão importados)
              </span>
            )}
          </div>

          <div className="mb-6 overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line bg-bg-tint text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-2.5">Linha</th>
                  <th className="px-4 py-2.5">Nome</th>
                  <th className="px-4 py-2.5">CPF</th>
                  <th className="px-4 py-2.5">Nascimento</th>
                  <th className="px-4 py-2.5">Sexo</th>
                  <th className="px-4 py-2.5">Contato</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.linha} className={`border-b border-line last:border-b-0 ${registro.erros.length > 0 ? "bg-coral/5" : ""}`}>
                    <td className="px-4 py-2.5 text-text-muted">{registro.linha}</td>
                    <td className="px-4 py-2.5">{registro.nomeCompleto || "—"}</td>
                    <td className="px-4 py-2.5">{registro.cpf ? mascararCpf(registro.cpf) : "—"}</td>
                    <td className="px-4 py-2.5">{registro.dataNascimento || "—"}</td>
                    <td className="px-4 py-2.5">{registro.sexo || "—"}</td>
                    <td className="px-4 py-2.5">{registro.contato || "—"}</td>
                    <td className="px-4 py-2.5">
                      {registro.erros.length === 0 ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-seafoam">
                          <CheckCircle2 size={14} /> OK
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-coral">{registro.erros.join("; ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {importado !== null ? (
            <p className="flex items-center gap-2 text-sm font-medium text-seafoam">
              <CheckCircle2 size={16} /> {importado} conta(s) provisionada(s) com sucesso.
            </p>
          ) : (
            <button
              type="button"
              onClick={confirmarImportacao}
              disabled={validos.length === 0 || importando}
              className="btn-primary rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {importando ? "Importando..." : `Confirmar importação (${validos.length})`}
            </button>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
