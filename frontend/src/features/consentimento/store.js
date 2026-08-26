import { create } from "zustand";

import { VERSAO_TERMO } from "./termo";

const STORAGE_KEY = "rastria:consentimento-lgpd";

// TODO: substituir por dado real do backend (ex: campo em Usuario, gravado no
// POST /api/auth/primeiro-acesso/:token/) quando o endpoint existir — hoje é
// só client-side, para viabilizar a tela sem depender do backend. O aceite
// não é revogável pelo usuário (ver issue "Tela de consentimento LGPD no
// primeiro acesso"), então esta store não expõe nenhuma ação de revogar.
function getInicial() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export const useConsentimentoStore = create((set) => ({
  consentimento: getInicial(),
  registrarAceite: () => {
    const registro = { versao: VERSAO_TERMO, aceitoEm: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registro));
    set({ consentimento: registro });
  },
}));
