import { create } from "zustand";

export const useAuthStore = create((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),
  logout: () => {
    localStorage.removeItem("rastria_access_token");
    set({ usuario: null });
  },
}));
