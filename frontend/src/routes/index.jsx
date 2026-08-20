import { Route, Routes } from "react-router-dom";

import Cadastro from "../pages/Cadastro/Cadastro";
import DashboardEducadorFisico from "../pages/DashboardEducadorFisico/DashboardEducadorFisico";
import DashboardGerente from "../pages/DashboardGerente/DashboardGerente";
import DashboardMedico from "../pages/DashboardMedico/DashboardMedico";
import DashboardUsuario from "../pages/DashboardUsuario/DashboardUsuario";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Onboarding from "../pages/Onboarding/Onboarding";
import SolicitarAcompanhamento from "../pages/SolicitarAcompanhamento/SolicitarAcompanhamento";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/gerente" element={<DashboardGerente />} />
      <Route path="/medico" element={<DashboardMedico />} />
      <Route path="/educador-fisico" element={<DashboardEducadorFisico />} />
      <Route path="/usuario" element={<DashboardUsuario />} />
      <Route path="/usuario/solicitar" element={<SolicitarAcompanhamento />} />
    </Routes>
  );
}