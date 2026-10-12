import { limparBreadcrumb, limparEvento } from "./limparEvento";

/**
 * Monitoramento de erros em produção (issue #188).
 *
 * Só liga com `VITE_SENTRY_DSN` definido e fora do dev server; sem DSN nada é
 * carregado nem enviado. O SDK entra por import dinâmico — vira um chunk à
 * parte que só é baixado quando o monitoramento está ligado, então quem não
 * configura Sentry não paga o peso no bundle.
 *
 * Privacidade (dado de saúde): `sendDefaultPii: false`, sem session replay,
 * sem tracing, e todo evento/breadcrumb passa por `limparEvento.js` antes de
 * sair. O que é enviado está documentado em agents/claude.md ("Monitoramento
 * de erros").
 *
 * O destino (ingest do Sentry) entra no `connect-src` da CSP pelo build
 * (config/csp.js) — sem isso o navegador bloquearia o envio.
 */

const DSN = import.meta.env.VITE_SENTRY_DSN;

let sentry = null;

export function monitoramentoLigado() {
  return Boolean(DSN) && !import.meta.env.DEV;
}

export async function iniciarMonitoramento() {
  if (!monitoramentoLigado() || sentry) return;
  const Sentry = await import("@sentry/react");
  Sentry.init({
    dsn: DSN,
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    // Sem replay e sem breadcrumbs de console/DOM: os dois capturam o que está
    // na tela ou no log, e a tela tem dado de saúde.
    integrations: (padrao) =>
      padrao
        .filter((integracao) => integracao.name !== "Breadcrumbs")
        .concat(Sentry.breadcrumbsIntegration({ console: false, dom: false })),
    beforeBreadcrumb: limparBreadcrumb,
    beforeSend: limparEvento,
  });
  sentry = Sentry;
}

/** Reporta um erro capturado (ex.: ErrorBoundary). Sem monitoramento, não faz nada. */
export function reportarErro(erro, contexto) {
  if (!sentry) return;
  // Só a pilha de componentes: aponta onde quebrou sem levar props/estado.
  sentry.captureException(erro, {
    contexts: contexto?.componentStack ? { react: { componentStack: contexto.componentStack } } : undefined,
  });
}
