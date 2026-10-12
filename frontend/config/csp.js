/**
 * Content-Security-Policy e demais headers de segurança do frontend, montados
 * no build a partir das variáveis de ambiente (issue #192).
 *
 * Antes a CSP morava duplicada (public/serve.json e uma constante no
 * vite.config.js) com `connect-src https://*.railway.app` — curinga que
 * autoriza qualquer app hospedado no Railway, inclusive um de atacante, como
 * destino de exfiltração num XSS. Agora:
 *
 * - `connect-src` recebe só a **origem exata** de `VITE_API_URL` (e das outras
 *   origens que o app de fato chama, como o Sentry, #188);
 * - o header (serve.json gerado em dist/) e a `<meta>` de reforço saem do
 *   mesmo template, então não divergem;
 * - origem com curinga, ou http fora de localhost, derruba o build.
 *
 * Roda em Node (vite.config.js), não no navegador.
 */

const LOCAIS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Extrai a origem (`esquema://host[:porta]`) de uma URL para usar na CSP.
 * Lança erro para o que não pode entrar na política.
 *
 * @param {string | undefined} url
 * @returns {string | null} origem, ou null se `url` estiver vazia
 */
export function origemParaCsp(url) {
  if (url === undefined || url === null || url.trim() === "") return null;
  if (url.includes("*")) {
    throw new Error(`CSP: curinga não é permitido em origem de conexão (${url}).`);
  }

  let analisada;
  try {
    analisada = new URL(url);
  } catch {
    throw new Error(`CSP: "${url}" não é uma URL absoluta.`);
  }

  const local = LOCAIS.has(analisada.hostname);
  if (analisada.protocol !== "https:" && !(analisada.protocol === "http:" && local)) {
    throw new Error(`CSP: "${url}" precisa ser https (http só é aceito para localhost).`);
  }
  return analisada.origin;
}

/**
 * @param {object} opcoes
 * @param {string[]} [opcoes.origensConexao] origens extras para `connect-src`
 * @param {boolean} [opcoes.paraMeta] `frame-ancestors` é ignorado pelo
 *   navegador quando vem de `<meta>` — só entra no header.
 * @returns {string}
 */
export function montarCsp({ origensConexao = [], paraMeta = false } = {}) {
  const conexao = ["'self'", ...new Set(origensConexao.filter(Boolean))];
  const diretivas = [
    ["default-src", "'self'"],
    ["base-uri", "'self'"],
    ["object-src", "'none'"],
    paraMeta ? null : ["frame-ancestors", "'none'"],
    ["form-action", "'self'"],
    ["img-src", "'self' data: blob:"],
    ["font-src", "'self' https://fonts.gstatic.com"],
    ["style-src", "'self' 'unsafe-inline' https://fonts.googleapis.com"],
    ["script-src", "'self'"],
    ["connect-src", conexao.join(" ")],
  ].filter(Boolean);

  const csp = diretivas.map(([nome, valor]) => `${nome} ${valor}`).join("; ");
  if (/(^|\s)(https?:\/\/)?\*/.test(csp.replace(/'[^']*'/g, ""))) {
    throw new Error(`CSP: a política gerada contém curinga de host: ${csp}`);
  }
  return csp;
}

/**
 * Conteúdo do `serve.json` gerado em dist/ — o `serve` injeta estes headers
 * em toda resposta (issue #111).
 *
 * @param {string} csp
 */
export function montarServeJson(csp) {
  return {
    headers: [
      {
        source: "**",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=()",
          },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ],
  };
}
