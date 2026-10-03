import { exibirCpf } from "../lib/cpf";

/**
 * Exibição de CPF em tela (issue #118). Use sempre isto em vez de interpolar o
 * valor cru: mascarado é o default, e mostrar completo exige `proprioDono`.
 *
 * O número mascarado continua sendo dado pessoal — o `<span>` carrega o rótulo
 * para leitor de tela não ler "ponto asterisco asterisco" como se fosse texto.
 */
export function Cpf({ valor, proprioDono = false, className = "" }) {
  const texto = exibirCpf(valor, { proprioDono });
  return (
    <span className={className}>
      <span className="sr-only">CPF{proprioDono ? "" : " (parcial)"}: </span>
      {texto}
    </span>
  );
}
