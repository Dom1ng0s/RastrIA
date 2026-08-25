import { Link } from "react-router-dom";

/**
 * Estado vazio padrão para listas do app. Sem `actionLabel`/`actionTo`, funciona
 * como mensagem puramente informativa (ex: "nenhum exame atrasado" — não há
 * ação nenhuma esperada do usuário nesse caso). Com os dois, vira um
 * call-to-action ativo (ex: "cadastre seu primeiro exame").
 *
 * Decisão de design (issue "estados vazios com call-to-action"): nem toda
 * lista vazia deve forçar um botão de ação — em telas onde o dado é
 * populado institucionalmente (ex: "Meus pacientes" de um médico), não existe
 * ação própria do usuário para resolver o vazio, então o componente permanece
 * só informativo nesses casos.
 */
export function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-8 text-center">
      {Icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg-tint text-text-muted">
          <Icon size={20} />
        </div>
      )}
      <p className="text-sm font-medium text-text-dark">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-[320px] text-xs text-text-muted">{description}</p>}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="btn-primary mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
