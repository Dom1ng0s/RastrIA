import { create } from "zustand";

// Preferências de acessibilidade (issues #95 e #149). Toda preferência
// configurável de acessibilidade mora aqui e aparece em Configurações ›
// Acessibilidade — nenhuma tela guarda a sua. Correção de conformidade
// (WCAG AA / eMAG) NÃO entra nesta lista: vale para todos, sempre.
//
// Client-side por ora (localStorage, mesmo padrão de `features/theme/store.js`);
// migram para preferência real do usuário (GET/PATCH /api/usuarios/me) quando
// o endpoint existir.
//
// Para acrescentar uma preferência, basta uma entrada em PREFERENCIAS:
// - `padrao`     → valor enquanto o usuário não escolher;
// - `classe`     → classe alternada no <html> (o efeito visual mora em
//                  `styles/index.css`); sem ela, quem consome lê o store;
// - `mediaQuery` → quando existe, o padrão vem da preferência do sistema
//                  operacional (e acompanha mudanças nela) até o usuário
//                  escolher explicitamente.
export const PREFERENCIAS = {
  fonteGrande: { padrao: false, classe: "fonte-grande" },
  // Escopo ainda será refinado com a equipe (issue #95).
  modoSimplificado: { padrao: false, classe: "modo-simplificado" },
  espacamentoTexto: { padrao: false, classe: "espacamento-texto" },
  altoContraste: {
    padrao: false,
    classe: "alto-contraste",
    mediaQuery: "(prefers-contrast: more)",
  },
  reduzirMovimento: {
    padrao: false,
    classe: "reduzir-movimento",
    mediaQuery: "(prefers-reduced-motion: reduce)",
  },
  // Atalhos Alt+1/Alt+2 do eMAG (issue #134), lidos por `AtalhosTeclado.jsx`.
  atalhosTeclado: { padrao: true },
  focoReforcado: { padrao: false, classe: "foco-reforcado" },
};

// Só as escolhas explícitas do usuário são gravadas: chave ausente = "segue o
// padrão". É isso que permite o padrão do sistema valer até o usuário mexer,
// e "Restaurar padrões" é simplesmente apagar tudo. O formato antigo (todas
// as chaves gravadas) continua válido — vira escolha explícita.
const STORAGE_KEY = "rastria:acessibilidade";

function lerEscolhas() {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return Object.fromEntries(
      Object.entries(salvo).filter(([chave, valor]) => chave in PREFERENCIAS && typeof valor === "boolean"),
    );
  } catch {
    return {};
  }
}

function gravarEscolhas(escolhas) {
  try {
    if (Object.keys(escolhas).length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(escolhas));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage indisponível (navegação privativa, cota) — as classes já
    // foram aplicadas; a preferência só não sobrevive ao reload.
  }
}

function valorDoSistema({ padrao, mediaQuery }) {
  if (!mediaQuery || typeof window.matchMedia !== "function") return padrao;
  return window.matchMedia(mediaQuery).matches;
}

function resolver(escolhas) {
  return Object.fromEntries(
    Object.entries(PREFERENCIAS).map(([chave, def]) => [chave, escolhas[chave] ?? valorDoSistema(def)]),
  );
}

function aplicarClasses(prefs) {
  const raiz = document.documentElement;
  Object.entries(PREFERENCIAS).forEach(([chave, { classe }]) => {
    if (classe) raiz.classList.toggle(classe, prefs[chave]);
  });
}

// Aplicado assim que o módulo é importado (ver main.jsx) para evitar flash de
// layout antes da primeira renderização.
const escolhasIniciais = lerEscolhas();
const prefsIniciais = resolver(escolhasIniciais);
aplicarClasses(prefsIniciais);

export const useAcessibilidadeStore = create((set, get) => {
  const atualizar = (escolhas) => {
    gravarEscolhas(escolhas);
    const prefs = resolver(escolhas);
    aplicarClasses(prefs);
    set({ ...prefs, escolhas });
  };

  return {
    ...prefsIniciais,
    escolhas: escolhasIniciais,
    alternar: (chave) => atualizar({ ...get().escolhas, [chave]: !get()[chave] }),
    restaurarPadroes: () => atualizar({}),
  };
});

// Mudou a preferência no sistema operacional com o app aberto: reaplica o que
// ainda segue o sistema. O que o usuário escolheu explicitamente não muda.
Object.entries(PREFERENCIAS).forEach(([chave, { mediaQuery }]) => {
  if (!mediaQuery || typeof window.matchMedia !== "function") return;
  window.matchMedia(mediaQuery).addEventListener("change", () => {
    const { escolhas } = useAcessibilidadeStore.getState();
    if (chave in escolhas) return;
    const prefs = resolver(escolhas);
    aplicarClasses(prefs);
    useAcessibilidadeStore.setState(prefs);
  });
});
