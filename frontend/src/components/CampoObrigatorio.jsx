/**
 * Sinalização de campo obrigatório (issue #147, WCAG 3.3.2 / eMAG 6.5). Padrão
 * único do app: asterisco no rótulo + `aria-required="true"` no campo + a
 * legenda `AvisoObrigatorios` no topo do formulário. Antes o usuário só
 * descobria que o campo era obrigatório depois do erro.
 *
 * O asterisco é `aria-hidden`: quem usa leitor de tela ouve "obrigatório" pelo
 * `aria-required` do campo, sem o "asterisco" repetido em cada rótulo.
 *
 * Uso: `<label htmlFor="x">Nome <MarcaObrigatorio /></label>` e, no campo,
 * `aria-required="true"`.
 */
export function MarcaObrigatorio() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-coral-escuro">
      *
    </span>
  );
}

export function AvisoObrigatorios({ className = "mb-4" }) {
  return (
    <p className={`text-xs text-text-muted ${className}`}>
      Campos marcados com <span className="text-coral-escuro">*</span> são obrigatórios.
    </p>
  );
}
