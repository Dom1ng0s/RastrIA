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
