import { create } from "zustand";

// Preferências de acessibilidade (issue #95). Persistidas em localStorage no
// mesmo padrão de `features/theme/store.js` e `features/ranking/store.js` —
// client-side por ora; migram para preferência real do usuário
// (GET/PATCH /api/usuarios/me) quando o endpoint existir.
//
// - `fonteGrande`      → classe `.fonte-grande` no <html>, aumenta a escala
//                        tipográfica base (todo o app usa rem, então escala junto).
// - `modoSimplificado` → classe `.modo-simplificado` no <html>, esconde
//                        elementos decorativos e reforça espaçamento/contraste.
//   O escopo exato do "modo simplificado" ainda será refinado com a equipe
//   (ver issue #95) — o CSS em `styles/index.css` é a versão conservadora inicial.
// - `atalhosTeclado`   → liga os atalhos Alt+1/Alt+2 do eMAG (issue #134), ver
//                        `AtalhosTeclado.jsx`. Não mexe em classe do <html>.
const STORAGE_KEY = "rastria:acessibilidade";

const PADRAO = { fonteGrande: false, modoSimplificado: false, atalhosTeclado: true };

function getInicial() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? { ...PADRAO, ...JSON.parse(bruto) } : { ...PADRAO };
  } catch {
    return { ...PADRAO };
  }
}

function aplicar(prefs) {
  const raiz = document.documentElement;
  raiz.classList.toggle("fonte-grande", prefs.fonteGrande);
  raiz.classList.toggle("modo-simplificado", prefs.modoSimplificado);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage indisponível (navegação privativa, cota) — as classes já
    // foram aplicadas; a preferência só não sobrevive ao reload.
  }
}

// Aplicado assim que o módulo é importado (ver main.jsx) para evitar flash de
// layout antes da primeira renderização.
const prefsIniciais = getInicial();
aplicar(prefsIniciais);

// Só as chaves de preferência — o estado do store também carrega as ações.
function extrairPrefs(estado) {
  return Object.fromEntries(Object.keys(PADRAO).map((chave) => [chave, estado[chave]]));
}

export const useAcessibilidadeStore = create((set, get) => {
  const alternar = (chave) => {
    const prefs = { ...extrairPrefs(get()), [chave]: !get()[chave] };
    aplicar(prefs);
    set({ [chave]: prefs[chave] });
  };

  return {
    ...prefsIniciais,
    toggleFonteGrande: () => alternar("fonteGrande"),
    toggleModoSimplificado: () => alternar("modoSimplificado"),
    toggleAtalhosTeclado: () => alternar("atalhosTeclado"),
  };
});
