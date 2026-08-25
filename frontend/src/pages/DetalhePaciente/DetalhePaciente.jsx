import { LayoutDashboard, Users } from "lucide-react";
import { useParams } from "react-router-dom";

import { DetalheIntegrante } from "../../components/DetalheIntegrante";

const navItems = [
  { to: "/medico", label: "Painel do Médico", icon: LayoutDashboard },
  { to: "/medico/atendimentos", label: "Meus Atendimentos", icon: Users },
];

// TODO: buscar nome real via GET /api/integrantes/:id quando o endpoint existir.
const NOMES_MOCK = { 1: "Bruno Alves", 2: "Fernanda Dias" };

export default function DetalhePaciente() {
  const { id } = useParams();

  return (
    <DetalheIntegrante
      nome={NOMES_MOCK[id] ?? "Paciente"}
      voltarPara="/medico"
      navItems={navItems}
      tituloPagina="Painel do Médico"
      escopo="clinico"
    />
  );
}
