import { LayoutDashboard, Users } from "lucide-react";

import { AtendimentosRealizados } from "../../components/AtendimentosRealizados";

const navItems = [
  { to: "/medico", label: "Painel do Médico", icon: LayoutDashboard },
  { to: "/medico/atendimentos", label: "Meus Atendimentos", icon: Users },
];

export default function AtendimentosMedico() {
  return (
    <AtendimentosRealizados
      navItems={navItems}
      tituloPagina="Painel do Médico"
      escopo="clinico"
      detalheBase="/medico/paciente"
    />
  );
}
