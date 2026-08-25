import { LayoutDashboard, Users } from "lucide-react";

import { AtendimentosRealizados } from "../../components/AtendimentosRealizados";

const navItems = [
  { to: "/educador-fisico", label: "Painel do Educador Físico", icon: LayoutDashboard },
  { to: "/educador-fisico/atendimentos", label: "Meus Atendimentos", icon: Users },
];

export default function AtendimentosEducadorFisico() {
  return (
    <AtendimentosRealizados navItems={navItems} tituloPagina="Painel do Educador Físico" escopo="fisico" />
  );
}
