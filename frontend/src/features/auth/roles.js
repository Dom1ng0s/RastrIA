// Lista de papéis oferecida na tela de login. Hoje só define para onde
// navegar (não há autenticação real ainda — ver TODO em pages/Login/Login.jsx
// e "Estado Atual do Repositório" em agents/claude.md).
// `instituicaoId` simula o vínculo institucional que viria do backend —
// usado para filtrar profissionais/colegas pela mesma instituição (issue #15).
export const ROLES = [
  { id: "comando", label: "Responsável pelo Comando", path: "/gerente", instituicaoId: 1 },
  { id: "medico", label: "Responsável Médico", path: "/medico", instituicaoId: 1 },
  { id: "educador-fisico", label: "Responsável Educador Físico", path: "/educador-fisico", instituicaoId: 1 },
  { id: "usuario", label: "Usuário", path: "/usuario", instituicaoId: 1 },
];

// Tela inicial de cada papel — destino pós-login e para onde a proteção de rota
// (features/auth/RotaProtegida.jsx, issue #61) manda quem tenta abrir uma rota
// de outro papel. Fallback pro /login se o papel for desconhecido.
// TODO: com o login real, o destino vem da resposta do backend, não deste mapa.
export function caminhoInicialDoPapel(papel) {
  return ROLES.find((role) => role.id === papel)?.path ?? "/login";
}
