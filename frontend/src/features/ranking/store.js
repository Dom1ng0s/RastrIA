import { create } from "zustand";

const STORAGE_KEY = "rastria:ranking:opt-out";

// TODO: substituir por preferência real do usuário via TanStack Query
// (GET/PATCH /api/usuarios/me) quando o endpoint existir — hoje é só
// client-side, para viabilizar o opt-out sem depender do backend (ver
// pendência do ranking, issue #6/#14, em agents/claude.md).
function getInitialOptOut() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export const useRankingPrefsStore = create((set, get) => ({
  optedOut: getInitialOptOut(),
  toggleOptOut: () => {
    const next = !get().optedOut;
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    set({ optedOut: next });
  },
}));
