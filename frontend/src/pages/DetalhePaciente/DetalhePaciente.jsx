import { LayoutDashboard, Users } from "lucide-react";
import { useParams } from "react-router-dom";

import { DetalheIntegrante } from "../../components/DetalheIntegrante";
import { useIntegrante } from "../../features/integrantes/queries";

const navItems = [
  { to: "/medico", label: "Painel do Médico", icon: LayoutDashboard },
  { to: "/medico/atendimentos", label: "Meus Atendimentos", icon: Users },
];

export default function DetalhePaciente() {
  const { id } = useParams();
  // Nome vem da camada de dados (issue #125); enquanto carrega (ou se o
  // integrante não for encontrado) o cabeçalho cai no rótulo genérico.
  const integrante = useIntegrante(id, "clinico");

  return (
    <DetalheIntegrante
      nome={integrante.data?.nome ?? "Paciente"}
      voltarPara="/medico"
      navItems={navItems}
      tituloPagina="Painel do Médico"
      escopo="clinico"
    />
  );
}
