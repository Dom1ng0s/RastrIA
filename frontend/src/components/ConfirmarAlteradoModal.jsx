import { AlertTriangle } from "lucide-react";

import { Modal } from "./Modal";

/**
 * Confirmação explícita ao visualizar um registro "Alterado" (issue #97).
 * Um badge na lista não garante que a pessoa notou e entendeu a gravidade —
 * este modal exige uma ação explícita (botão "Entendi") antes de permitir
 * fechar, então `onClose` é ignorado (Esc/clique no backdrop não fecham)
 * enquanto o registro não tiver sido confirmado.
 */
export function ConfirmarAlteradoModal({ registro, confirmado, onConfirmar, onClose }) {
  const podeFecharLivremente = confirmado;

  return (
    <Modal
      tituloId="confirmar-alterado-titulo"
      onClose={() => {
        if (podeFecharLivremente) onClose();
      }}
      className="w-full max-w-[420px] rounded-2xl bg-white p-6"
    >
      <div className="mb-3 flex items-center gap-2 text-coral">
        <AlertTriangle size={20} />
        <h2 id="confirmar-alterado-titulo" className="text-base font-semibold text-text-dark">
          Resultado alterado
        </h2>
      </div>

      <p className="text-sm font-medium text-text-dark">{registro.indice}</p>
      <p className="mb-4 text-xs text-text-muted">
        {registro.data} · {registro.valor}
      </p>

      <p className="mb-5 text-sm text-text-muted">
        Esse resultado está fora da faixa de referência considerada normal. Recomendamos que você
        solicite acompanhamento a um médico da sua instituição para avaliar esse índice.
      </p>

      {confirmado ? (
        <button
          type="button"
          onClick={onClose}
          className="btn-outline w-full rounded-lg py-2.5 text-sm font-semibold"
        >
          Fechar
        </button>
      ) : (
        <button
          type="button"
          onClick={onConfirmar}
          className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold"
        >
          Entendi
        </button>
      )}
    </Modal>
  );
}
