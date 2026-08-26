/**
 * Utilitários de CPF — usados no login (identificador único do usuário, ver
 * issue "troca de senha obrigatória no primeiro acesso (login por CPF)") e em
 * qualquer tela que precise exibir CPF de forma mascarada (ex: painel do
 * gerente) sem nunca mostrar o número completo para quem não é o próprio dono.
 */

export function formatarCpf(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Valida dígito verificador — não é só checagem de formato/tamanho. */
export function validarCpf(valor) {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base) => {
    let soma = 0;
    let peso = base.length + 1;
    for (const digito of base) {
      soma += Number(digito) * peso;
      peso -= 1;
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(cpf.slice(0, 9));
  const digito2 = calcularDigito(cpf.slice(0, 9) + digito1);

  return cpf === cpf.slice(0, 9) + String(digito1) + String(digito2);
}

/** CPF nunca deve aparecer completo em tela que não seja a do próprio dono
 * (ver "Regras de Design" em agents/claude.md) — só os 3 primeiros dígitos. */
export function mascararCpf(valor) {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11) return valor;
  return `${cpf.slice(0, 3)}.***.***-**`;
}
