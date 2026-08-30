// Ponto único de leitura/escrita/remoção dos tokens JWT no cliente. Nenhum outro
// módulo deve tocar nas chaves do localStorage diretamente — assim, trocar o
// mecanismo de armazenamento é uma mudança local a este arquivo.
//
// Decisão (issue #65): por ora os tokens ficam em `localStorage`. A alternativa
// mais robusta contra XSS — refresh token em cookie `httpOnly` + `Secure`, com
// o access token curto em memória — depende de endpoints e configuração de
// CORS/CSRF no backend, que ainda não está deployado (ver "Estado Atual do
// Repositório" em agents/claude.md). Quando esse backend existir, só este módulo
// e o interceptor em `lib/api.js` precisam mudar.

const CHAVE_ACCESS = "rastria_access_token";
const CHAVE_REFRESH = "rastria_refresh_token";

function lerSeguro(chave) {
  try {
    return localStorage.getItem(chave);
  } catch {
    // localStorage indisponível (modo privado / cota / storage bloqueado).
    return null;
  }
}

export function getAccessToken() {
  return lerSeguro(CHAVE_ACCESS);
}

export function getRefreshToken() {
  return lerSeguro(CHAVE_REFRESH);
}

/**
 * Persiste o par de tokens. Cada campo é opcional: um refresh silencioso que só
 * devolve `access` não apaga o `refresh` atual.
 */
export function setTokens({ access, refresh } = {}) {
  try {
    if (access) localStorage.setItem(CHAVE_ACCESS, access);
    if (refresh) localStorage.setItem(CHAVE_REFRESH, refresh);
  } catch {
    // Sem localStorage a sessão sobrevive só enquanto a aba estiver aberta.
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(CHAVE_ACCESS);
    localStorage.removeItem(CHAVE_REFRESH);
  } catch {
    /* nada a limpar se o storage não está acessível */
  }
}
