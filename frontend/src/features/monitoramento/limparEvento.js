/**
 * Limpeza de eventos antes de enviar ao Sentry (issue #188).
 *
 * O app lida com dado de saúde (LGPD art. 11): nada de corpo de requisição,
 * query string, cookie, header, usuário, CPF ou o que estiver digitado na
 * tela pode sair do navegador junto com um erro. O que sobra é o suficiente
 * para depurar: tipo e pilha do erro, rota (sem query), release e navegador.
 *
 * Funções puras, sem import do Sentry — testáveis sem DOM e sem rede.
 */

// CPF com ou sem pontuação (000.000.000-00 / 00000000000).
const CPF = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
// E-mail — contato do integrante (planilha de importação, perfil).
const EMAIL = /[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+/g;

export function mascararTexto(texto) {
  if (typeof texto !== "string") return texto;
  return texto.replace(CPF, "[cpf]").replace(EMAIL, "[email]");
}

/** Tira query string e fragmento: filtro, token de ativação e afins ficam de fora. */
export function urlSemParametros(url) {
  if (typeof url !== "string") return url;
  return url.split(/[?#]/, 1)[0];
}

// Breadcrumbs de interface (clique, digitação) e de console carregam texto da
// tela e dado logado; navegação e chamadas de rede (sem query) ficam.
const CATEGORIAS_DESCARTADAS = /^(ui\.|console$)/;

export function limparBreadcrumb(breadcrumb) {
  if (!breadcrumb || CATEGORIAS_DESCARTADAS.test(breadcrumb.category ?? "")) return null;
  const limpo = { ...breadcrumb, message: mascararTexto(breadcrumb.message) };
  if (breadcrumb.data) {
    limpo.data = {};
    for (const chave of ["url", "from", "to"]) {
      if (breadcrumb.data[chave]) limpo.data[chave] = urlSemParametros(breadcrumb.data[chave]);
    }
    for (const chave of ["method", "status_code"]) {
      if (breadcrumb.data[chave] !== undefined) limpo.data[chave] = breadcrumb.data[chave];
    }
  }
  return limpo;
}

export function limparEvento(evento) {
  if (!evento) return evento;
  const limpo = { ...evento };

  delete limpo.user;
  delete limpo.extra;
  delete limpo.contexts?.state;

  if (limpo.request) {
    limpo.request = { url: urlSemParametros(limpo.request.url) };
  }

  limpo.message = mascararTexto(limpo.message);

  if (limpo.exception?.values) {
    limpo.exception = {
      ...limpo.exception,
      values: limpo.exception.values.map((valor) => ({ ...valor, value: mascararTexto(valor.value) })),
    };
  }

  if (Array.isArray(limpo.breadcrumbs)) {
    limpo.breadcrumbs = limpo.breadcrumbs.map(limparBreadcrumb).filter(Boolean);
  }

  return limpo;
}
