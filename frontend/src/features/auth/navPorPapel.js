import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Stethoscope,
  Trophy,
  Users,
} from "lucide-react";

// Menu lateral (`navItems` do DashboardLayout) por papel. Telas alcançáveis por
// todos os papéis — hoje só o Perfil (rota `/perfil`, sem guarda de papel) —
// devem montar o menu a partir daqui, derivando do papel logado, em vez de
// assumir o contexto de "usuário individual".
//
// Os dashboards de cada papel ainda declaram seu próprio `navItems` local (com
// passos de tour que só fazem sentido lá); esses arrays devem convergir para
// este mapa quando o tour for desacoplado da definição do menu.
//
// TODO: enquanto não há autenticação real, o papel vem do atalho de
// desenvolvimento no Login (`features/auth/roles.js`) e é lido via
// `useAuthStore`. Com o login real, virá do usuário autenticado (payload do JWT
// / GET /api/usuarios/me) — este mapa continua válido, só muda a origem do papel.
export const NAV_POR_PAPEL = {
  usuario: [
    { to: "/usuario", label: "Meu Histórico", icon: LayoutDashboard },
    { to: "/usuario/cadastrar-informacoes", label: "Cadastrar Informações", icon: ClipboardList },
    { to: "/usuario/solicitar", label: "Solicitar Acompanhamento", icon: Stethoscope },
    { to: "/usuario/atendimentos", label: "Meus Atendimentos", icon: FileText },
    { to: "/usuario/ranking", label: "Ranking", icon: Trophy },
  ],
  medico: [
    { to: "/medico", label: "Painel do Médico", icon: LayoutDashboard },
    { to: "/medico/atendimentos", label: "Meus Atendimentos", icon: Users },
  ],
  "educador-fisico": [
    { to: "/educador-fisico", label: "Painel do Educador Físico", icon: LayoutDashboard },
    { to: "/educador-fisico/atendimentos", label: "Meus Atendimentos", icon: Users },
  ],
  comando: [{ to: "/gerente", label: "Painel Agregado", icon: LayoutDashboard }],
};

// Papel assumido quando não há usuário em memória (ex.: abrir `/perfil` direto
// pela URL, sem passar pelo atalho de login). "usuário individual" é o menu mais
// completo e o caso de uso mais comum.
export const PAPEL_PADRAO = "usuario";

export function navItemsDoPapel(papel) {
  return NAV_POR_PAPEL[papel] ?? NAV_POR_PAPEL[PAPEL_PADRAO];
}
