import { LayoutDashboard, Users } from "lucide-react";
import { useParams } from "react-router-dom";

import { DetalheIntegrante } from "../../components/DetalheIntegrante";

const navItems = [
  { to: "/educador-fisico", label: "Painel do Educador Físico", icon: LayoutDashboard },
  { to: "/educador-fisico/atendimentos", label: "Meus Atendimentos", icon: Users },
];

// TODO: buscar nome real via GET /api/integrantes/:id quando o endpoint existir.
const NOMES_MOCK = { 1: "Diego Martins", 2: "Juliana Prado" };

export default function DetalheAluno() {
  const { id } = useParams();

  return (
    <DetalheIntegrante
      nome={NOMES_MOCK[id] ?? "Aluno"}
      voltarPara="/educador-fisico"
      navItems={navItems}
      tituloPagina="Painel do Educador Físico"
      escopo="fisico"
    />
  );
}
