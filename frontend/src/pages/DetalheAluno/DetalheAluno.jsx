import { LayoutDashboard, Users } from "lucide-react";
import { useParams } from "react-router-dom";

import { DetalheIntegrante } from "../../components/DetalheIntegrante";
import { useIntegrante } from "../../features/integrantes/queries";

const navItems = [
  { to: "/educador-fisico", label: "Painel do Educador Físico", icon: LayoutDashboard },
  { to: "/educador-fisico/atendimentos", label: "Meus Atendimentos", icon: Users },
];

export default function DetalheAluno() {
  const { id } = useParams();
  // Nome vem da camada de dados (issue #125); enquanto carrega (ou se o
  // integrante não for encontrado) o cabeçalho cai no rótulo genérico.
  const integrante = useIntegrante(id, "fisico");

  return (
    <DetalheIntegrante
      nome={integrante.data?.nome ?? "Aluno"}
      voltarPara="/educador-fisico"
      navItems={navItems}
      tituloPagina="Painel do Educador Físico"
      escopo="fisico"
    />
  );
}
