// Lista de papéis oferecida na tela de login. Hoje só define para onde
// navegar (não há autenticação real ainda — ver TODO em pages/Login/Login.jsx
// e "Estado Atual do Repositório" em agents/claude.md).
export const ROLES = [
  { id: "comando", label: "Responsável pelo Comando", path: "/gerente" },
  { id: "medico", label: "Responsável Médico", path: "/medico" },
  { id: "educador-fisico", label: "Responsável Educador Físico", path: "/educador-fisico" },
  { id: "usuario", label: "Usuário", path: "/usuario" },
];
