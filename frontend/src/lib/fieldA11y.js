/**
 * Props ARIA que ligam a mensagem de erro de um campo ao seu controle, para que
 * o leitor de tela anuncie o erro ao focar o campo (ver issue #42). Usar junto
 * com `<FieldError id={`${nome}-erro`}>`; `nome` deve casar com o `id` do input.
 */
export function fieldErrorProps(erro, nome) {
  if (!erro) return {};
  return { "aria-invalid": true, "aria-describedby": `${nome}-erro` };
}
