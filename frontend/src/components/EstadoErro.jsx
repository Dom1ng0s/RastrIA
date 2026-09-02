import { AlertTriangle } from "lucide-react";

/**
 * Bloco de erro reutilizável (issue #120), no mesmo espírito do `EmptyState`:
 * mensagem + ação de recuperação. Toda tela que consome um hook de
 * `features/<área>/queries.js` (issue #119) deve renderizar isto quando
 * `isError` for verdadeiro, passando `onRetry={refetch}`.
 *
 * Sem `onRetry`, funciona como aviso de erro puramente informativo.
 */
export function EstadoErro({
  title = "Não foi possível carregar",
  description = "Ocorreu um erro ao buscar estes dados. Tente novamente em instantes.",
  onRetry,
  retryLabel = "Tentar novamente",
}) {
  return (
    <div role="alert" className="rounded-xl border border-dashed border-line p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg-tint text-coral">
        <AlertTriangle size={20} />
      </div>
      <p className="text-sm font-medium text-text-dark">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-[320px] text-xs text-text-muted">{description}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-outline mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
