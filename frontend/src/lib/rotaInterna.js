/**
 * Sanitiza um caminho antes de usa-lo como destino de redirecionamento interno
 * (ex: "voltar pra rota que a pessoa tentou abrir antes de logar", ver
 * features/auth/RotaProtegida.jsx e o TODO de redirect pos-login em
 * pages/Login/Login.jsx).
 *
 * Defesa em profundidade contra open redirect (issue #107 / GHSA-wrjc-x8rr-h8h6):
 * mesmo com o react-router ja normalizando barra invertida em <Link>/useNavigate,
 * um `from` vindo de query string, campo de formulario ou localStorage nunca deve
 * poder mandar o usuario pra um dominio externo. So aceita caminho absoluto do
 * proprio app ("/algo"); "//evil.com", "/\evil.com", "https://evil.com" e afins
 * caem no fallback.
 *
 * @param {unknown} caminho  candidato a rota interna
 * @param {string} fallback  destino usado quando `caminho` nao e seguro
 * @returns {string}
 */
export function rotaInternaSegura(caminho, fallback = "/") {
  if (typeof caminho !== "string" || caminho === "") return fallback;
  if (caminho === "/") return caminho;

  // precisa ser caminho absoluto do app ("/..."), mas nao "//..." — barra dupla
  // vira URL protocol-relative ("//evil.com" -> http://evil.com)
  if (caminho[0] !== "/" || caminho[1] === "/") return fallback;

  // "/\evil.com": navegadores tratam "\" como "/", virando "//evil.com". Idem
  // quando o 2o caractere e espaco ou caractere de controle (codigo <= 0x20) ou
  // DEL (0x7f) — o navegador remove esses da URL antes de resolver, o que pode
  // colapsar "/\tevil.com" em "//evil.com".
  const segundoCodigo = caminho.charCodeAt(1);
  if (
    caminho[1] === "\\" ||
    Number.isNaN(segundoCodigo) ||
    segundoCodigo <= 0x20 ||
    segundoCodigo === 0x7f
  ) {
    return fallback;
  }

  // nao pode embutir um esquema antes da primeira "/" interna
  // ("/x:y", "/javascript:alert(1)")
  const primeiroSegmento = caminho.slice(1).split("/", 1)[0];
  if (primeiroSegmento.includes(":")) return fallback;

  return caminho;
}
