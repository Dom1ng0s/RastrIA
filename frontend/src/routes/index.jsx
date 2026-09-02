import { Route, Routes } from "react-router-dom";

import { RotaProtegida } from "../features/auth/RotaProtegida";
import { SessaoInativa } from "../features/auth/SessaoInativa";
import AlterarSenha from "../pages/AlterarSenha/AlterarSenha";
import CadastroExercicioFisico from "../pages/CadastroExercicioFisico/CadastroExercicioFisico";
import CadastroInformacoes from "../pages/CadastroInformacoes/CadastroInformacoes";
import CadastroTAF from "../pages/CadastroTAF/CadastroTAF";
import ConfigurarHierarquia from "../pages/ConfigurarHierarquia/ConfigurarHierarquia";
import ImportarIntegrantes from "../pages/ImportarIntegrantes/ImportarIntegrantes";
import AtendimentosEducadorFisico from "../pages/AtendimentosEducadorFisico/AtendimentosEducadorFisico";
import AtendimentosMedico from "../pages/AtendimentosMedico/AtendimentosMedico";
import DashboardEducadorFisico from "../pages/DashboardEducadorFisico/DashboardEducadorFisico";
import DashboardGerente from "../pages/DashboardGerente/DashboardGerente";
import DashboardMedico from "../pages/DashboardMedico/DashboardMedico";
import DashboardUsuario from "../pages/DashboardUsuario/DashboardUsuario";
import DetalheAluno from "../pages/DetalheAluno/DetalheAluno";
import DetalhePaciente from "../pages/DetalhePaciente/DetalhePaciente";
import EsqueciSenha from "../pages/EsqueciSenha/EsqueciSenha";
import HistoricoAtendimentos from "../pages/HistoricoAtendimentos/HistoricoAtendimentos";
import RedefinirSenha from "../pages/RedefinirSenha/RedefinirSenha";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import Onboarding from "../pages/Onboarding/Onboarding";
import Perfil from "../pages/Perfil/Perfil";
import PoliticaDePrivacidade from "../pages/PoliticaDePrivacidade/PoliticaDePrivacidade";
import PrimeiroAcesso from "../pages/PrimeiroAcesso/PrimeiroAcesso";
import RankingFisico from "../pages/RankingFisico/RankingFisico";
import SolicitarAcompanhamento from "../pages/SolicitarAcompanhamento/SolicitarAcompanhamento";
import TelaPorUnidade from "../pages/TelaPorUnidade/TelaPorUnidade";
import TermoConsentimento from "../pages/TermoConsentimento/TermoConsentimento";
import TermosDeUso from "../pages/TermosDeUso/TermosDeUso";

// NOTA: não existe mais rota de autocadastro (/cadastro) nem de autorização de
// usuário pendente (/gerente/autorizacao) — contas são provisionadas
// administrativamente (import em lote via Django admin), não criadas pelo
// próprio usuário. Ver seção 16 de DOCUMENTACAO.md (decisão de 23/08/2026).
//
// Proteção de rota por papel (issue #61): rotas de painel ficam atrás de
// <RotaProtegida> — sem login vão pro /login, com papel errado vão pra tela
// inicial do papel logado. Enquanto não há auth real, o papel vem do atalho de
// dev do Login (features/auth/roles.js), persistido em localStorage. As telas de
// acesso (login, primeiro acesso, redefinição, onboarding) e as páginas
// institucionais públicas (landing, termos, política) continuam sem guarda.
const COMANDO = ["comando"];
const MEDICO = ["medico"];
const EDUCADOR_FISICO = ["educador-fisico"];
const USUARIO = ["usuario"];

export function AppRoutes() {
  return (
    <>
      {/* Encerra a sessão após inatividade (issue #92) — inócuo sem usuário logado. */}
      <SessaoInativa />
      <Routes>
      {/* Públicas — sem login */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/primeiro-acesso/:token" element={<PrimeiroAcesso />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/termos-de-uso" element={<TermosDeUso />} />
      <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />

      {/* Configurações — qualquer papel autenticado (ver issues #72 e #88).
          A rota continua sendo /perfil; o menu lateral a chama de "Configurações". */}
      <Route element={<RotaProtegida />}>
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/alterar-senha" element={<AlterarSenha />} />
        <Route path="/perfil/termo-consentimento" element={<TermoConsentimento />} />
      </Route>

      {/* Comando */}
      <Route element={<RotaProtegida papeis={COMANDO} />}>
        <Route path="/gerente" element={<DashboardGerente />} />
        <Route path="/gerente/unidade/:id" element={<TelaPorUnidade />} />
        <Route path="/gerente/hierarquia" element={<ConfigurarHierarquia />} />
        <Route path="/gerente/importar-integrantes" element={<ImportarIntegrantes />} />
      </Route>

      {/* Médico */}
      <Route element={<RotaProtegida papeis={MEDICO} />}>
        <Route path="/medico" element={<DashboardMedico />} />
        <Route path="/medico/paciente/:id" element={<DetalhePaciente />} />
        <Route path="/medico/atendimentos" element={<AtendimentosMedico />} />
      </Route>

      {/* Educador físico */}
      <Route element={<RotaProtegida papeis={EDUCADOR_FISICO} />}>
        <Route path="/educador-fisico" element={<DashboardEducadorFisico />} />
        <Route path="/educador-fisico/aluno/:id" element={<DetalheAluno />} />
        <Route path="/educador-fisico/aluno/:id/taf" element={<CadastroTAF />} />
        <Route path="/educador-fisico/atendimentos" element={<AtendimentosEducadorFisico />} />
      </Route>

      {/* Usuário individual */}
      <Route element={<RotaProtegida papeis={USUARIO} />}>
        <Route path="/usuario" element={<DashboardUsuario />} />
        <Route path="/usuario/cadastrar-informacoes" element={<CadastroInformacoes />} />
        <Route path="/usuario/cadastrar-informacoes/exercicio" element={<CadastroExercicioFisico />} />
        <Route path="/usuario/solicitar" element={<SolicitarAcompanhamento />} />
        <Route path="/usuario/atendimentos" element={<HistoricoAtendimentos />} />
        <Route path="/usuario/ranking" element={<RankingFisico />} />
      </Route>

      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
