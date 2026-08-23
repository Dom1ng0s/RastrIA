import { Route, Routes } from "react-router-dom";

import CadastroExercicioFisico from "../pages/CadastroExercicioFisico/CadastroExercicioFisico";
import CadastroInformacoes from "../pages/CadastroInformacoes/CadastroInformacoes";
import DashboardEducadorFisico from "../pages/DashboardEducadorFisico/DashboardEducadorFisico";
import DashboardGerente from "../pages/DashboardGerente/DashboardGerente";
import DashboardMedico from "../pages/DashboardMedico/DashboardMedico";
import DashboardUsuario from "../pages/DashboardUsuario/DashboardUsuario";
import DetalheAluno from "../pages/DetalheAluno/DetalheAluno";
import DetalhePaciente from "../pages/DetalhePaciente/DetalhePaciente";
import EsqueciSenha from "../pages/EsqueciSenha/EsqueciSenha";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import Onboarding from "../pages/Onboarding/Onboarding";
import Perfil from "../pages/Perfil/Perfil";
import SolicitarAcompanhamento from "../pages/SolicitarAcompanhamento/SolicitarAcompanhamento";
import TelaPorUnidade from "../pages/TelaPorUnidade/TelaPorUnidade";

// NOTA: não existe mais rota de autocadastro (/cadastro) nem de autorização de
// usuário pendente (/gerente/autorizacao) — contas são provisionadas
// administrativamente (import em lote via Django admin), não criadas pelo
// próprio usuário. Ver seção 16 de DOCUMENTACAO.md (decisão de 23/08/2026).
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/gerente" element={<DashboardGerente />} />
      <Route path="/gerente/unidade/:id" element={<TelaPorUnidade />} />
      <Route path="/medico" element={<DashboardMedico />} />
      <Route path="/medico/paciente/:id" element={<DetalhePaciente />} />
      <Route path="/educador-fisico" element={<DashboardEducadorFisico />} />
      <Route path="/educador-fisico/aluno/:id" element={<DetalheAluno />} />
      <Route path="/usuario" element={<DashboardUsuario />} />
      <Route path="/usuario/cadastrar-informacoes" element={<CadastroInformacoes />} />
      <Route path="/usuario/cadastrar-informacoes/exercicio" element={<CadastroExercicioFisico />} />
      <Route path="/usuario/solicitar" element={<SolicitarAcompanhamento />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
