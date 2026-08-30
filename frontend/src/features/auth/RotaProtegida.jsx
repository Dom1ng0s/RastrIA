import { Navigate, Outlet, useLocation } from "react-router-dom";

import { caminhoInicialDoPapel } from "./roles";
import { useAuthStore } from "./store";

// Guarda de rota por papel. Enquanto não há autenticação real, `usuario` vem do
// atalho de dev do Login e fica persistido em localStorage (features/auth/
// store.js), então a proteção sobrevive a um reload. Ver issue #61.
//
// - sem usuário logado → manda pro /login, guardando a rota tentada em
//   `location.state.from` (para um futuro "voltar pra onde ia depois de logar")
// - logado, mas com papel fora de `papeis` → manda pra tela inicial do papel
//   dele; não é 404 nem "acesso negado", é levar a pessoa pra onde ela pode estar
// - `papeis` omitido → basta estar logado (ex: /perfil, comum a todos os papéis)
//
// Usável como wrapper (`<RotaProtegida><Tela /></RotaProtegida>`) ou como rota de
// layout com filhas (`<Route element={<RotaProtegida papeis={...} />}>`).
export function RotaProtegida({ papeis, children }) {
  const usuario = useAuthStore((state) => state.usuario);
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (papeis && !papeis.includes(usuario.papel)) {
    return <Navigate to={caminhoInicialDoPapel(usuario.papel)} replace />;
  }

  return children ?? <Outlet />;
}
