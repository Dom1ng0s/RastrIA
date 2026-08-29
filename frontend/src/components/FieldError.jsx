/**
 * Mensagem de erro de um campo de formulário. `role="alert"` faz o leitor de
 * tela anunciar a mensagem assim que ela aparece; o `id` liga o texto ao input
 * via `aria-describedby` (ver `fieldErrorProps` e issue #42). Sem `children`,
 * não renderiza nada — pode ficar sempre no JSX no lugar do antigo
 * `{errors.x && <p>...</p>}`.
 */
export function FieldError({ id, children, className = "" }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className={`text-xs text-coral ${className}`}>
      {children}
    </p>
  );
}
