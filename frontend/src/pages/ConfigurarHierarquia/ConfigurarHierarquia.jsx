import { Building2, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import { DashboardLayout } from "../../components/DashboardLayout";
import { EmptyState } from "../../components/EmptyState";
import { useHierarquiaStore } from "../../features/hierarquia/store";
import { navItems } from "../DashboardGerente/DashboardGerente";

/**
 * Configuração inicial de hierarquia de unidades (issue #98) — o Gerente
 * monta a própria estrutura (Batalhão > Companhia), em vez de depender de um
 * desenvolvedor mexendo direto no código/banco. Alimenta DashboardGerente e
 * TelaPorUnidade. Estado local por enquanto (features/hierarquia/store.js) —
 * persistência real depende de modelagem de backend ainda não definida.
 */
function LinhaEditavel({ nome, onSalvar, onExcluir, placeholder, confirmarExclusao }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(nome);

  function salvar() {
    const nomeAparado = valor.trim();
    if (!nomeAparado) return;
    onSalvar(nomeAparado);
    setEditando(false);
  }

  if (editando) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          type="text"
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") salvar();
            if (evento.key === "Escape") {
              setValor(nome);
              setEditando(false);
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-text-dark"
        />
        <button type="button" onClick={salvar} aria-label="Salvar" className="text-seafoam hover:opacity-80">
          <Check size={18} />
        </button>
        <button
          type="button"
          onClick={() => {
            setValor(nome);
            setEditando(false);
          }}
          aria-label="Cancelar"
          className="text-text-muted hover:text-text-dark"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-dark">{nome}</span>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setEditando(true)}
          aria-label="Renomear"
          className="text-text-muted hover:text-primary"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!confirmarExclusao || window.confirm(confirmarExclusao)) onExcluir();
          }}
          aria-label="Excluir"
          className="text-text-muted hover:text-coral"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function FormularioNovo({ placeholder, botaoLabel, onAdicionar }) {
  const [valor, setValor] = useState("");

  function adicionar(evento) {
    evento.preventDefault();
    const nomeAparado = valor.trim();
    if (!nomeAparado) return;
    onAdicionar(nomeAparado);
    setValor("");
  }

  return (
    <form onSubmit={adicionar} className="flex items-center gap-2">
      <input
        type="text"
        value={valor}
        onChange={(evento) => setValor(evento.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-sm text-text-dark"
      />
      <button
        type="submit"
        className="btn-primary flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
      >
        <Plus size={14} /> {botaoLabel}
      </button>
    </form>
  );
}

export default function ConfigurarHierarquia() {
  const unidades = useHierarquiaStore((state) => state.unidades);
  const adicionarBatalhao = useHierarquiaStore((state) => state.adicionarBatalhao);
  const editarBatalhao = useHierarquiaStore((state) => state.editarBatalhao);
  const removerBatalhao = useHierarquiaStore((state) => state.removerBatalhao);
  const adicionarCompanhia = useHierarquiaStore((state) => state.adicionarCompanhia);
  const editarCompanhia = useHierarquiaStore((state) => state.editarCompanhia);
  const removerCompanhia = useHierarquiaStore((state) => state.removerCompanhia);

  return (
    <DashboardLayout title="Configurar Unidades" navItems={navItems}>
      <p className="mb-6 text-sm text-text-muted">
        Monte a estrutura de unidades da sua instituição (Batalhão e Companhia). Essa hierarquia
        alimenta o Painel Agregado e o detalhamento por unidade — nunca aparece dado clínico
        individual aqui.
      </p>

      <div className="mb-6 max-w-[520px] rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-text-dark">Novo batalhão</h2>
        <FormularioNovo
          placeholder="Ex: 4º Batalhão"
          botaoLabel="Adicionar"
          onAdicionar={adicionarBatalhao}
        />
      </div>

      <div className="space-y-4">
        {unidades.map((unidade) => (
          <div key={unidade.id} className="max-w-[640px] rounded-2xl border border-line bg-white p-6">
            <LinhaEditavel
              nome={unidade.nome}
              onSalvar={(nome) => editarBatalhao(unidade.id, nome)}
              onExcluir={() => removerBatalhao(unidade.id)}
              confirmarExclusao={
                unidade.subunidades.length > 0
                  ? `Remover "${unidade.nome}" também remove suas ${unidade.subunidades.length} companhia(s). Continuar?`
                  : `Remover "${unidade.nome}"?`
              }
            />

            <div className="mt-4 space-y-2 border-t border-line pt-4">
              {unidade.subunidades.map((sub) => (
                <div key={sub.id} className="pl-4">
                  <LinhaEditavel
                    nome={sub.nome}
                    onSalvar={(nome) => editarCompanhia(unidade.id, sub.id, nome)}
                    onExcluir={() => removerCompanhia(unidade.id, sub.id)}
                    confirmarExclusao={`Remover "${sub.nome}"?`}
                  />
                </div>
              ))}

              <div className="pl-4">
                <FormularioNovo
                  placeholder="Ex: 4ª Companhia"
                  botaoLabel="Companhia"
                  onAdicionar={(nome) => adicionarCompanhia(unidade.id, nome)}
                />
              </div>
            </div>
          </div>
        ))}

        {unidades.length === 0 && (
          <EmptyState
            icon={Building2}
            title="Nenhum batalhão cadastrado ainda"
            description="Adicione o primeiro batalhão da sua instituição para começar."
          />
        )}
      </div>
    </DashboardLayout>
  );
}
