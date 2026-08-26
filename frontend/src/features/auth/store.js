import { create } from "zustand";

// TODO: `usuario` deve vir do backend (payload do JWT ou GET /api/usuarios/me)
// quando a autenticação real existir. Por ora, é preenchido pelo atalho de
// desenvolvimento em pages/Login/Login.jsx, incluindo `instituicaoId` — usado
// para filtrar profissionais/colegas pela mesma instituição (ver issue #15,
// "fim da rede pré-qualificada entre instituições").
export const useAuthStore = create((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),
  logout: () => {
    localStorage.removeItem("rastria_access_token");
    set({ usuario: null });
  },
}));
