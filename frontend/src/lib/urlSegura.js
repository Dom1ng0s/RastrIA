import { rotaInternaSegura } from "./rotaInterna";

/**
 * Sanitiza uma URL vinda de dado (API, mock, arquivo) antes de usá-la em
 * `href`/`src` — issue #197.
 *
 * O React não bloqueia `href="javascript:..."` (só avisa no console): um valor
 * desses vindo do backend vira XSS no clique. Aqui só passa o que um anexo ou
 * arquivo servido pela aplicação pode legitimamente ser:
 *
 * - caminho absoluto do próprio app ("/mock/x.png"), validado pelas mesmas
 *   regras de `rotaInternaSegura` (barra dupla, "/\", controle, esquema
 *   embutido caem fora);
 * - `https:` — a URL assinada que o backend devolve para anexos (#185);
 * - `blob:` — o arquivo local recém-escolhido, antes do upload.
 *
 * Todo o resto (`javascript:`, `data:`, `vbscript:`, `http:`, `file:`, texto
 * que não é URL) devolve `undefined`, e quem chama deixa de renderizar o link.
 * O parser `URL` já descarta espaço e caractere de controle no início, do
 * mesmo jeito que o navegador faria — "\tjavascript:" também cai fora.
 *
 * @param {unknown} url
 * @returns {string | undefined}
 */
export function urlSegura(url) {
  if (typeof url !== "string" || url === "") return undefined;

  if (rotaInternaSegura(url, null) === url) return url;

  let analisada;
  try {
    analisada = new URL(url);
  } catch {
    return undefined;
  }

  if (analisada.protocol === "https:") return analisada.href;
  if (analisada.protocol === "blob:") {
    // blob: carrega a origem que o criou ("blob:https://app/uuid"); a origem
    // interna também precisa ser https (ou http local, em desenvolvimento).
    const origemInterna = analisada.pathname.split("/", 3).slice(0, 3).join("/");
    if (/^https:\/\//.test(origemInterna) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origemInterna)) {
      return url;
    }
  }
  return undefined;
}
