import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const CHAVE_USUARIO = "rastria:usuario";

/**
 * O store lê o `localStorage` na importação do módulo, e a flag de demo é uma
 * const avaliada no import — então cada caso precisa reimportar tudo do zero
 * com a variável de ambiente já definida.
 */
async function importarStoreCom(modoDemo) {
  vi.resetModules();
  if (modoDemo === undefined) {
    vi.stubEnv("VITE_MODO_DEMO", undefined);
  } else {
    vi.stubEnv("VITE_MODO_DEMO", modoDemo);
  }
  return (await import("./store")).useAuthStore;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

// Regressão da issue #128. Esconder o atalho "entrar direto como..." do Login
// não bastava: o papel fica persistido no localStorage e o store reidrata a
// sessão a partir dele, então bastaria escrever essa chave à mão para entrar
// como qualquer papel — inclusive Comando, que vê o painel agregado.
//
// Isto NÃO é a proteção de verdade (quem recusa o pedido é o backend, issues
// #103 e #59). É a garantia de que a porta de demonstração não fica aberta no
// build de piloto por descuido.
describe("useAuthStore — reidratação do papel a partir do localStorage", () => {
  it("ignora papel semeado à mão quando o modo demo está desligado", async () => {
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ papel: "comando", instituicaoId: 1 }));
    const useAuthStore = await importarStoreCom("false");
    expect(useAuthStore.getState().usuario).toBeNull();
  });

  it("restaura a sessão quando o modo demo está ligado", async () => {
    // Sem isto, o atalho de demonstração não sobreviveria a um F5.
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify({ papel: "comando", instituicaoId: 1 }));
    const useAuthStore = await importarStoreCom("true");
    expect(useAuthStore.getState().usuario).toEqual({ papel: "comando", instituicaoId: 1 });
  });

  it("não quebra com conteúdo inválido no localStorage", async () => {
    localStorage.setItem(CHAVE_USUARIO, "{isso não é json");
    const useAuthStore = await importarStoreCom("true");
    expect(useAuthStore.getState().usuario).toBeNull();
  });
});

describe("useAuthStore — logout", () => {
  it("limpa usuário, tokens e preferências escopadas ao usuário", async () => {
    const useAuthStore = await importarStoreCom("true");
    localStorage.setItem("rastria:consentimento-lgpd", "true");
    localStorage.setItem("rastria:ranking:opt-out", "true");
    localStorage.setItem("rastria:tour:usuario", "visto");
    useAuthStore.getState().setUsuario({ papel: "usuario", instituicaoId: 1 });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().usuario).toBeNull();
    expect(localStorage.getItem(CHAVE_USUARIO)).toBeNull();
    // Preferência de um usuário não pode vazar para o próximo que usar o mesmo
    // navegador — cenário real ao trocar de papel numa demonstração.
    expect(localStorage.getItem("rastria:consentimento-lgpd")).toBeNull();
    expect(localStorage.getItem("rastria:ranking:opt-out")).toBeNull();
    expect(localStorage.getItem("rastria:tour:usuario")).toBeNull();
  });

  it("preserva o tema, que é preferência do dispositivo e não do usuário", async () => {
    const useAuthStore = await importarStoreCom("true");
    localStorage.setItem("rastria:theme", "dark");
    useAuthStore.getState().setUsuario({ papel: "usuario", instituicaoId: 1 });

    useAuthStore.getState().logout();

    expect(localStorage.getItem("rastria:theme")).toBe("dark");
  });
});
