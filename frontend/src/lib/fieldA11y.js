/**
 * Props ARIA que ligam a mensagem de erro de um campo ao seu controle, para que
 * o leitor de tela anuncie o erro ao focar o campo (ver issue #42). Usar junto
 * com `<FieldError id={`${nome}-erro`}>`; `nome` deve casar com o `id` do input.
 *
 * `{ dica: true }`: o campo tem um texto de ajuda persistente em
 * `<p id={`${nome}-dica`}>` (formato esperado, ex.: CPF, data) — ele fica
 * sempre no `aria-describedby`, antes do erro (issue #147). Placeholder não
 * serve para isso: some ao digitar e não é lido de forma confiável.
 */
export function fieldErrorProps(erro, nome, { dica = false } = {}) {
  const descricoes = [dica && `${nome}-dica`, erro && `${nome}-erro`].filter(Boolean);
  return {
    ...(erro ? { "aria-invalid": true } : {}),
    ...(descricoes.length ? { "aria-describedby": descricoes.join(" ") } : {}),
  };
}
