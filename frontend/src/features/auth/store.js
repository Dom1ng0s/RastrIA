import { create } from "zustand";

// TODO: `usuario` deve vir do backend (payload do JWT ou GET /api/usuarios/me)
// quando a autenticação real existir. Por ora, é preenchido pelo atalho de
// desenvolvimento em pages/Login/Login.jsx, incluindo `instituicaoId` — usado
// para filtrar profissionais/colegas pela mesma instituição (ver issue #15,
// "fim da rede pré-qualificada entre instituições").
//
// `usuario` é espelhado em `rastria:usuario` no localStorage só para o atalho de
// dev sobreviver a um reload — sem isso, a proteção de rota (features/auth/
// RotaProtegida.jsx, issue #61) jogaria a pessoa de volta pro /login a cada F5.
// Com o login real, o que persiste é o token; o papel vem do backend, não daqui.
const STORAGE_KEY_USUARIO = "rastria:usuario";

// Chaves de preferência escopadas ao usuário logado. Enquanto não há backend,
// essas preferências ficam no localStorage — ao sair, precisam ser limpas para
// não vazar de uma pessoa para a próxima que usar o mesmo navegador (ex: trocar
// de papel pelo atalho de teste). O tema (`rastria:theme`) fica de fora de
// propósito: é preferência do dispositivo, não do usuário.
// TODO: quando o login real existir, essas preferências devem vir do backend
// (GET /api/usuarios/me), não do localStorage — e o logout limpa só o token.
const CHAVES_PREFERENCIA_USUARIO = ["rastria:consentimento-lgpd", "rastria:ranking:opt-out"];
const PREFIXO_TOUR = "rastria:tour:";

function lerUsuarioSalvo() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY_USUARIO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function limparEstadoDoUsuario() {
  localStorage.removeItem("rastria_access_token");
  localStorage.removeItem(STORAGE_KEY_USUARIO);
  CHAVES_PREFERENCIA_USUARIO.forEach((chave) => localStorage.removeItem(chave));
  Object.keys(localStorage)
    .filter((chave) => chave.startsWith(PREFIXO_TOUR))
    .forEach((chave) => localStorage.removeItem(chave));
}

export const useAuthStore = create((set) => ({
  usuario: lerUsuarioSalvo(),
  setUsuario: (usuario) => {
    try {
      localStorage.setItem(STORAGE_KEY_USUARIO, JSON.stringify(usuario));
    } catch {
      // localStorage indisponível (modo privado / cota): segue só em memória.
    }
    set({ usuario });
  },
  logout: () => {
    limparEstadoDoUsuario();
    set({ usuario: null });
  },
}));
