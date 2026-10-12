import axios from "axios";

import { clearTokens, getAccessToken, setAccessToken } from "./authTokens";

// URL da API. Sem `VITE_API_URL` no build, não há backend para este deploy
// (hoje: o MVP com dados mockados) — `API_CONFIGURADA` diz isso a quem
// precisa saber, como o logout, que só avisa o servidor quando ele existe.
const URL_CONFIGURADA = import.meta.env.VITE_API_URL;
export const API_CONFIGURADA = Boolean(URL_CONFIGURADA);

export const api = axios.create({
  baseURL: URL_CONFIGURADA || "http://localhost:8000/api",
});

// Rotas de sessão (relativas à baseURL) — backend/apps/usuarios/autenticacao.py.
const ROTA_LOGIN = "/auth/token/";
const ROTA_REFRESH = "/auth/token/refresh/";
const ROTA_LOGOUT = "/auth/logout/";

// As chamadas de sessão vão com `withCredentials`: é o que faz o navegador
// mandar (e aceitar) o cookie HttpOnly do refresh (issue #190). Usam o axios
// "cru", sem os interceptors desta instância, para um 401 no próprio refresh
// não entrar em recursão.
export const sessao = axios.create({ baseURL: api.defaults.baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Login. O backend devolve `{access}` e grava o refresh no cookie.
 * TODO(#177): a tela de Login passa a chamar isto (com CPF) no lugar do atalho
 * mockado.
 */
export async function entrar(credenciais) {
  const { data } = await sessao.post(ROTA_LOGIN, credenciais);
  setAccessToken(data.access);
  return data;
}

/**
 * Logout no servidor: o refresh do cookie vai para a blacklist e o cookie é
 * apagado. Nunca lança — sair tem que funcionar mesmo com a rede fora.
 */
export async function sair() {
  clearTokens();
  if (!API_CONFIGURADA) return;
  try {
    await sessao.post(ROTA_LOGOUT);
  } catch {
    // Sem rede ou sessão já expirada: o cookie expira sozinho (45 min).
  }
}

// --- Refresh silencioso em resposta 401 -------------------------------------
//
// O access token vive 15 min (SIMPLE_JWT em settings/base.py); quando expira
// — ou depois de recarregar a página, quando ele nem existe mais em memória —
// o backend responde 401. Em vez de propagar o erro, tentamos UMA vez obter um
// access novo pelo cookie de refresh e refazer a request original. Se o
// refresh também falhar (expirado por inatividade, revogado no logout ou na
// troca de senha, ausente), limpamos a sessão e mandamos para /login.
//
// `refreshEmAndamento` colapsa vários 401 simultâneos em um único POST de
// refresh: todas as requests aguardam a mesma promise e são refeitas depois.
// Isso importa mais agora: o refresh roda o token e põe o anterior na
// blacklist, então dois refreshes em paralelo derrubariam a sessão.

let refreshEmAndamento = null;

function encerrarSessao() {
  clearTokens();
  // api.js roda fora do React Router. Um redirect "hard" também descarta o
  // estado em memória (inclusive o `usuario` do useAuthStore) sem deixar resto.
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

/** Troca o cookie de refresh por um access novo. Devolve o access ou null. */
export function renovarAccessToken() {
  if (!refreshEmAndamento) {
    refreshEmAndamento = sessao
      .post(ROTA_REFRESH)
      .then(({ data }) => {
        if (!data?.access) return null;
        setAccessToken(data.access);
        return data.access;
      })
      .catch(() => null)
      .finally(() => {
        refreshEmAndamento = null;
      });
  }
  return refreshEmAndamento;
}

api.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    const original = erro.config;
    const status = erro.response?.status;

    if (status !== 401 || !original || original._retentado) {
      return Promise.reject(erro);
    }

    original._retentado = true;
    const novoAccess = await renovarAccessToken();

    if (!novoAccess) {
      encerrarSessao();
      return Promise.reject(erro);
    }

    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${novoAccess}`;
    return api(original);
  }
);
