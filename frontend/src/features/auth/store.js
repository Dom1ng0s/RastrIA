import { create } from "zustand";

// TODO: `usuario` deve vir do backend (payload do JWT ou GET /api/usuarios/me)
// quando a autenticação real existir. Por ora, é preenchido pelo atalho de
// desenvolvimento em pages/Login/Login.jsx, incluindo `instituicaoId` — usado
// para filtrar profissionais/colegas pela mesma instituição (ver issue #15,
// "fim da rede pré-qualificada entre instituições").
// Chaves de preferência escopadas ao usuário logado. Enquanto não há backend,
// essas preferências ficam no localStorage — ao sair, precisam ser limpas para
// não vazar de uma pessoa para a próxima que usar o mesmo navegador (ex: trocar
// de papel pelo atalho de teste). O tema (`rastria:theme`) fica de fora de
// propósito: é preferência do dispositivo, não do usuário.
// TODO: quando o login real existir, essas preferências devem vir do backend
// (GET /api/usuarios/me), não do localStorage — e o logout limpa só o token.
const CHAVES_PREFERENCIA_USUARIO = ["rastria:consentimento-lgpd", "rastria:ranking:opt-out"];
const PREFIXO_TOUR = "rastria:tour:";

function limparEstadoDoUsuario() {
  localStorage.removeItem("rastria_access_token");
  CHAVES_PREFERENCIA_USUARIO.forEach((chave) => localStorage.removeItem(chave));
  Object.keys(localStorage)
    .filter((chave) => chave.startsWith(PREFIXO_TOUR))
    .forEach((chave) => localStorage.removeItem(chave));
}

export const useAuthStore = create((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),
  logout: () => {
    limparEstadoDoUsuario();
    set({ usuario: null });
  },
}));
