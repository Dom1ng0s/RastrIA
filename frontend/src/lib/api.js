import axios from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./authTokens";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
});

// Rota (relativa à baseURL) que troca o refresh token por um novo access token.
const ROTA_REFRESH = "/auth/token/refresh/";

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Refresh silencioso em resposta 401 -------------------------------------
//
// O access token vive 1h (SIMPLE_JWT em settings/base.py); quando expira, o
// backend responde 401. Em vez de propagar o erro, tentamos UMA vez trocar o
// refresh token (7 dias) por um novo access e refazer a request original. Se o
// refresh também falhar (expirado, revogado, ausente), limpamos a sessão e
// mandamos para /login.
//
// `refreshEmAndamento` colapsa vários 401 simultâneos em um único POST de
// refresh: todas as requests aguardam a mesma promise e são refeitas depois.

let refreshEmAndamento = null;

function encerrarSessao() {
  clearTokens();
  // api.js roda fora do React Router. Um redirect "hard" também descarta o
  // estado em memória (inclusive o `usuario` do useAuthStore) sem deixar resto.
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

async function renovarAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    // axios "cru" (sem os interceptors desta instância) para o próprio refresh
    // não entrar em recursão de 401.
    const { data } = await axios.post(`${api.defaults.baseURL}${ROTA_REFRESH}`, { refresh });
    if (!data?.access) return null;
    // Com ROTATE_REFRESH_TOKENS ligado, o simplejwt devolve um novo `refresh`
    // junto; setTokens ignora campos ausentes se não vier.
    setTokens({ access: data.access, refresh: data.refresh });
    return data.access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    const original = erro.config;
    const status = erro.response?.status;

    if (
      status !== 401 ||
      !original ||
      original._retentado ||
      original.url?.includes(ROTA_REFRESH)
    ) {
      return Promise.reject(erro);
    }

    original._retentado = true;

    if (!refreshEmAndamento) {
      refreshEmAndamento = renovarAccessToken().finally(() => {
        refreshEmAndamento = null;
      });
    }

    const novoAccess = await refreshEmAndamento;

    if (!novoAccess) {
      encerrarSessao();
      return Promise.reject(erro);
    }

    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${novoAccess}`;
    return api(original);
  }
);
