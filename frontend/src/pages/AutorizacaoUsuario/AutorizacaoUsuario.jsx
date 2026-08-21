import { useState } from "react";
import { UserCheck } from "lucide-react";

import { DashboardLayout } from "../../components/DashboardLayout";
import { navItems } from "../DashboardGerente/DashboardGerente";

const PAPEIS = [
  { value: "integrante", label: "Integrante (institucional)" },
  { value: "medico", label: "Médico" },
  { value: "educador_fisico", label: "Educador Físico" },
  { value: "medico_do_trabalho", label: "Médico do trabalho" },
  { value: "gerente", label: "Gerente/Comandante" },
];

// TODO: substituir por dados reais via TanStack Query (GET /api/vinculos-institucionais?papel=null)
// quando o endpoint existir — usuários que se cadastraram com o código da instituição mas
// ainda não têm papel institucional atribuído pelo Comando/gestor (ver agents/claude.md,
// seção "Fluxo de cadastro").
const pendentesIniciais = [
  { id: 1, nome: "Diego Martins", email: "diego.martins@email.com", codigo: "PMAL01" },
  { id: 2, nome: "Juliana Prado", email: "juliana.prado@email.com", codigo: "PMAL01" },
  { id: 3, nome: "Rafael Costa", email: "rafael.costa@email.com", codigo: "PMAL01" },
];

export default function AutorizacaoUsuario() {
  const [pendentes, setPendentes] = useState(pendentesIniciais);
  const [selecionados, setSelecionados] = useState({});

  function autorizar(id) {
    // TODO: chamar mutation do TanStack Query (POST /api/vinculos-institucionais/)
    // com { usuario: id, instituicao: <instituicao_do_gerente>, papel: selecionados[id] }
    // quando o endpoint existir.
    setPendentes((atual) => atual.filter((pendente) => pendente.id !== id));
  }

  return (
    <DashboardLayout title="Autorizar Usuários" navItems={navItems}>
      <div className="mb-6 rounded-lg border border-line bg-white p-4 text-sm text-text-muted">
        Toda conta cadastrada com o código da instituição nasce sem papel institucional definido.
        Atribua o cargo real de cada integrante abaixo — só depois disso a pessoa passa a acessar
        o painel correspondente.
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Pendentes de autorização</h2>
      <div className="space-y-3">
        {pendentes.map((pendente) => (
          <div key={pendente.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{pendente.nome}</p>
                <span className="text-xs text-text-muted">
                  {pendente.email} · código {pendente.codigo}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selecionados[pendente.id] ?? ""}
                  onChange={(event) =>
                    setSelecionados((atual) => ({ ...atual, [pendente.id]: event.target.value }))
                  }
                  className="rounded-lg border border-line px-3.5 py-2.5 text-sm"
                >
                  <option value="" disabled>
                    Selecionar papel
                  </option>
                  {PAPEIS.map((papel) => (
                    <option key={papel.value} value={papel.value}>
                      {papel.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selecionados[pendente.id]}
                  onClick={() => autorizar(pendente.id)}
                  className="btn-primary flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  <UserCheck size={16} /> Autorizar
                </button>
              </div>
            </div>
          </div>
        ))}

        {pendentes.length === 0 && (
          <div className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-text-muted">
            Nenhum usuário pendente de autorização no momento.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
