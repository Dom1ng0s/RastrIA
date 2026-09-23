import { Bell, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useNotificacoesStore } from "../features/notificacoes/store";
import { rotaInternaSegura } from "../lib/rotaInterna";
import { EmptyState } from "./EmptyState";

/**
 * Painel de notificações no cabeçalho (issue #117) — sino com badge de não
 * lidas, dropdown que sobrepõe o conteúdo (mesmo padrão de overlay do
 * HelpMenu em DashboardLayout.jsx). Papel vem de quem chama (DashboardLayout
 * já sabe o papel logado via useAuthStore); cada papel só enxerga suas
 * próprias notificações mockadas.
 *
 * Cada notificação leva à tela que a originou (issue #129). O corpo vira um
 * <Link> quando há `destino`, e o botão de excluir continua sendo IRMÃO dele —
 * nunca aninhado dentro do link, que seria HTML inválido (mesmo cuidado da
 * issue #99). Sem `destino`, o corpo segue sendo um <button> que só marca
 * como lida.
 */
export function NotificacoesMenu({ papel }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  const notificacoes = useNotificacoesStore((state) => state.porPapel[papel] ?? []);
  const marcarLida = useNotificacoesStore((state) => state.marcarLida);
  const marcarTodasLidas = useNotificacoesStore((state) => state.marcarTodasLidas);
  const excluir = useNotificacoesStore((state) => state.excluir);
  const limparLidas = useNotificacoesStore((state) => state.limparLidas);

  const naoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;
  const temLidas = notificacoes.some((notificacao) => notificacao.lida);

  useEffect(() => {
    if (!aberto) return undefined;
    const aoClicarFora = (evento) => {
      if (ref.current && !ref.current.contains(evento.target)) setAberto(false);
    };
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  return (
    <div className="relative inline-flex items-center" ref={ref}>
      <button
        type="button"
        aria-label={`Notificações${naoLidas > 0 ? ` (${naoLidas} não lidas)` : ""}`}
        title="Notificações"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className="relative inline-flex h-5 w-5 items-center justify-center text-text-muted hover:text-primary"
      >
        <Bell size={20} />
        {naoLidas > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-coral-escuro px-1 text-xs font-semibold leading-none text-white">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-line bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Notificações</span>
            {naoLidas > 0 && (
              <button
                type="button"
                onClick={() => marcarTodasLidas(papel)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={Bell} title="Nenhuma notificação por enquanto" />
              </div>
            ) : (
              <ul>
                {notificacoes.map((notificacao) => (
                  <li
                    key={notificacao.id}
                    className={`group flex items-start gap-2 border-b border-line px-3 py-2.5 last:border-b-0 ${
                      notificacao.lida ? "" : "bg-bg-tint"
                    }`}
                  >
                    <ConteudoNotificacao
                      notificacao={notificacao}
                      onAbrir={() => {
                        marcarLida(papel, notificacao.id);
                        setAberto(false);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => excluir(papel, notificacao.id)}
                      aria-label="Excluir notificação"
                      title="Excluir"
                      className="shrink-0 text-text-muted opacity-0 hover:text-coral-escuro focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {temLidas && (
            <button
              type="button"
              onClick={() => limparLidas(papel)}
              className="flex w-full items-center justify-center gap-1.5 border-t border-line px-3 py-2 text-xs font-medium text-text-muted hover:bg-bg-tint hover:text-text-dark"
            >
              <Trash2 size={13} /> Limpar lidas
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Corpo clicável da notificação: <Link> quando ela aponta para alguma tela,
 * <button> quando é só um aviso. Nos dois casos o clique marca como lida e
 * fecha o painel.
 *
 * O destino passa por `rotaInternaSegura` mesmo vindo do nosso próprio mock:
 * quando o backend da issue #31 gerar esses eventos, o campo passa a ser dado
 * externo, e o lugar de sanitizar é aqui (defesa em profundidade contra open
 * redirect — issue #107).
 */
function ConteudoNotificacao({ notificacao, onAbrir }) {
  const classe = "min-w-0 flex-1 text-left";
  const destino = notificacao.destino ? rotaInternaSegura(notificacao.destino, "") : "";

  const corpo = (
    <span className="flex items-start gap-2">
      {!notificacao.lida && (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-escuro" aria-hidden="true" />
      )}
      <span className="min-w-0">
        <p className={`text-xs ${notificacao.lida ? "text-text-muted" : "font-medium text-text-dark"}`}>
          {notificacao.titulo}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">{notificacao.data}</p>
      </span>
    </span>
  );

  if (!destino) {
    return (
      <button type="button" onClick={onAbrir} className={classe}>
        {corpo}
      </button>
    );
  }

  return (
    <Link to={destino} onClick={onAbrir} className={`${classe} hover:underline`}>
      {corpo}
    </Link>
  );
}
