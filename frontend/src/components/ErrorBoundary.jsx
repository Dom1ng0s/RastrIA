import { Component } from "react";
import { Home, RotateCcw } from "lucide-react";

import { Logo } from "./Logo";

/**
 * Error Boundary de topo (issue #122). Sem ele, um erro de render em qualquer
 * tela derrubava o app inteiro para uma tela branca, sem orientação para quem
 * estava usando — risco que cresce quando dado real (menos previsível que os
 * mocks atuais) começar a passar pelas telas.
 *
 * Só o boundary global: erro em tela é raro e, quando acontece, o estado do app
 * já é duvidoso o bastante para preferir recarregar a seguir navegando.
 *
 * Fica dentro do <BrowserRouter>? Não — o fallback usa <a> e `location`, não o
 * router, justamente porque o erro pode ter vindo do próprio roteamento.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    // TODO(monitoramento): quando existir ferramenta de erro em produção (ex:
    // Sentry), reportar aqui — `Sentry.captureException(erro, { extra: info })`.
    // Até então o console é o único registro, e some quando a aba fecha.
    console.error("Erro não tratado na árvore de componentes:", erro, info);
  }

  render() {
    if (!this.state.erro) return this.props.children;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-tint px-6 text-center">
        <Logo className="mb-10" />
        {/* role="alert" não cabe aqui: a tela inteira trocou, e o <h1> já é
            anunciado pela mudança de contexto. */}
        <h1 className="mb-2 text-xl font-semibold text-primary">Algo deu errado</h1>
        <p className="mb-8 max-w-[380px] text-sm text-text-muted">
          Não conseguimos exibir esta tela. Seus dados não foram perdidos — recarregue
          a página para continuar de onde parou.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Recarregar a página
          </button>
          {/* <a>, não <Link>: recarga completa descarta o estado que quebrou. */}
          <a
            href="/"
            className="btn-outline flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            <Home size={16} aria-hidden="true" />
            Voltar ao início
          </a>
        </div>
      </main>
    );
  }
}
