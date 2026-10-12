// Ponto único de leitura/escrita/remoção do token de acesso no cliente.
//
// Issue #190 (revê a decisão provisória da #65): nenhum token fica mais em
// `localStorage`, que qualquer script na origem lê — um único XSS levava o
// refresh de 7 dias.
//
// - **access** (15 min): só em memória, nesta variável de módulo. Some ao
//   recarregar a página; o próximo 401 dispara o refresh (lib/api.js).
// - **refresh**: o frontend nunca o vê. O backend o grava em cookie
//   `HttpOnly; Secure; SameSite=Strict; Path=/api/auth/`
//   (backend/apps/usuarios/autenticacao.py) e o navegador o envia sozinho nas
//   chamadas de auth feitas com `withCredentials`.

let accessEmMemoria = null;

// Chaves da #65. Quem já tinha sessão antes desta mudança fica com tokens
// parados no localStorage: apaga uma vez, na carga do módulo.
const CHAVES_ANTIGAS = ["rastria_access_token", "rastria_refresh_token"];
try {
  CHAVES_ANTIGAS.forEach((chave) => localStorage.removeItem(chave));
} catch {
  // localStorage indisponível (modo privado / storage bloqueado): nada a limpar.
}

export function getAccessToken() {
  return accessEmMemoria;
}

export function setAccessToken(access) {
  accessEmMemoria = access || null;
}

export function clearTokens() {
  accessEmMemoria = null;
}
