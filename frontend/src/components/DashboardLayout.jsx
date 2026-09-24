import { Flag, HelpCircle, ListChecks, LogOut, Menu, Settings, Compass, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAcessibilidadeStore } from "../features/acessibilidade/store";
import { useAuthStore } from "../features/auth/store";
import { PAPEL_PADRAO } from "../features/auth/navPorPapel";
import { useToast } from "../features/ui/ToastProvider";
import { useTituloPagina } from "../lib/tituloPagina";
import { usePainelSuspenso } from "../lib/usePainelSuspenso";
import { ThemeToggle } from "../features/theme/ThemeToggle";

import { ConteudoPrincipal } from "./ConteudoPrincipal";
import { Gaveta } from "./Gaveta";
import { Logo } from "./Logo";
import { NotificacoesMenu } from "./NotificacoesMenu";
import { ReportarProblemaModal } from "./ReportarProblemaModal";

// Ícone de ajuda expandido (issue #91): além de reabrir o tour guiado, oferece
// um atalho para as perguntas frequentes (seção pública `/#faq` da Landing).
// Painel no padrão Disclosure (issue #139) — ver lib/usePainelSuspenso.js.
function HelpMenu({ onRever }) {
  const { aberto, fechar, containerRef, propsBotao, propsPainel } = usePainelSuspenso();

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        aria-label="Ajuda"
        title="Ajuda"
        {...propsBotao}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-bg-tint hover:text-primary"
      >
        <HelpCircle size={20} aria-hidden="true" />
      </button>
      {aberto && (
        <div
          {...propsPainel}
          className="absolute right-0 top-full z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            onClick={() => {
              fechar();
              onRever?.();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-dark hover:bg-bg-tint"
          >
            <Compass size={15} aria-hidden="true" /> Rever tour guiado
          </button>
          <a
            href="/#faq"
            onClick={() => fechar()}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-dark hover:bg-bg-tint"
          >
            <ListChecks size={15} aria-hidden="true" /> Ver perguntas frequentes
          </a>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ navItems, location, onNavigate, onReportarProblema }) {
  const logout = useAuthStore((state) => state.logout);

  const sair = () => {
    onNavigate?.();
    logout();
    // Navegação "dura" para forçar a reinicialização das stores (consentimento,
    // ranking, tour) que só leem o localStorage na carga — assim o estado de um
    // papel não permanece em memória para o próximo.
    window.location.assign("/login");
  };

  return (
    <>
      <div>
        <Logo reverse className="mb-10" />
        <nav aria-label="Navegação principal" data-navegacao-principal className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              data-tour={item.tour}
              className={`nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                location.pathname === item.to ? "active" : ""
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-1">
        <Link
          to="/perfil"
          onClick={onNavigate}
          data-tour="nav-configuracoes"
          className={`nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
            location.pathname.startsWith("/perfil") ? "active" : ""
          }`}
        >
          <Settings size={18} />
          Configurações
        </Link>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onReportarProblema?.();
          }}
          className="nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium"
        >
          <Flag size={18} />
          Reportar problema
        </button>
        <button
          type="button"
          onClick={sair}
          className="nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </>
  );
}

/**
 * Rola até a seção apontada pelo fragmento da URL (issue #129) — é o que faz
 * "/gerente#exames-atrasados", vindo de uma notificação, abrir o painel já na
 * seção certa. A âncora é o `data-tour` que as seções já carregam, com `id`
 * como alternativa; nada de marcação nova só para isto.
 *
 * As seções existem desde o primeiro render (só o conteúdo delas é skeleton),
 * então não é preciso esperar a consulta resolver. Quem pede menos movimento
 * recebe um salto direto, sem rolagem animada.
 */
function useRolarParaSecao(hash) {
  useEffect(() => {
    const alvoId = hash.replace(/^#/, "");
    if (!alvoId) return;

    const elemento =
      document.querySelector(`[data-tour="${CSS.escape(alvoId)}"]`) ?? document.getElementById(alvoId);
    if (!elemento) return;

    // Preferência da aba Acessibilidade, que já segue o sistema por padrão.
    const menosMovimento = useAcessibilidadeStore.getState().reduzirMovimento;
    elemento.scrollIntoView({ behavior: menosMovimento ? "auto" : "smooth", block: "start" });
  }, [hash]);
}

// `paginaAtual` diferencia o título da aba quando várias telas compartilham o
// mesmo `title` de painel (ex.: "Painel do Médico" no painel, nos atendimentos
// e no detalhe do paciente) — issue #135.
//
// `tituloNoConteudo`: a tela traz o próprio <h1> visível no conteúdo (ex.: nome
// do paciente) e o `title` do cabeçalho vira texto comum — cada tela tem um só
// <h1>, e ele descreve a tela, não o painel (issue #146).
export function DashboardLayout({ title, paginaAtual, navItems, children, onHelp, tituloNoConteudo = false }) {
  const TituloCabecalho = tituloNoConteudo ? "p" : "h1";
  useTituloPagina(paginaAtual, title);
  const location = useLocation();
  useRolarParaSecao(location.hash);
  const [menuAberto, setMenuAberto] = useState(false);
  const idGaveta = useId();
  const [reportarAberto, setReportarAberto] = useState(false);
  const { showToast } = useToast();
  const papel = useAuthStore((state) => state.usuario?.papel) ?? PAPEL_PADRAO;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa — telas médias/grandes */}
      <aside className="hidden w-64 flex-shrink-0 flex-col justify-between bg-primary p-6 md:flex">
        <SidebarContent
          navItems={navItems}
          location={location}
          onReportarProblema={() => setReportarAberto(true)}
        />
      </aside>

      {/* Gaveta mobile — diálogo modal (issue #140) */}
      {menuAberto && (
        <Gaveta
          id={idGaveta}
          rotulo="Menu"
          onFechar={() => setMenuAberto(false)}
          className="w-64 justify-between bg-primary p-6"
        >
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <SidebarContent
            navItems={navItems}
            location={location}
            onNavigate={() => setMenuAberto(false)}
            onReportarProblema={() => setReportarAberto(true)}
          />
        </Gaveta>
      )}

      {/* min-w-0: item flex não encolhe abaixo da largura mínima do próprio
          conteúdo por padrão — a coluna inteira crescia além da tela a 320px
          (zoom de 400%) e forçava rolagem horizontal (WCAG 1.4.10, #161). */}
      <div className="min-w-0 flex-1 bg-bg-tint">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-white px-5 py-5 md:px-8">
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            aria-controls={idGaveta}
            data-abrir-menu
            onClick={() => setMenuAberto(true)}
            className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-bg-tint md:hidden"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
          {/* flex-wrap no header + break-words no título: com "Fonte grande" ou
            "Espaçamento de texto" o título e os ícones não cabem numa linha a
            320px — os ícones descem em vez de empurrar a página (#161). */}
          <TituloCabecalho className="min-w-0 break-words text-xl font-semibold text-primary">{title}</TituloCabecalho>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <NotificacoesMenu papel={papel} />
            {onHelp && <HelpMenu onRever={onHelp} />}
          </div>
        </header>
        <ConteudoPrincipal className="mx-auto max-w-6xl p-5 md:p-8">{children}</ConteudoPrincipal>
      </div>

      {reportarAberto && (
        <ReportarProblemaModal
          telaAtual={title}
          onClose={() => setReportarAberto(false)}
          onEnviado={() => showToast("Problema reportado. Obrigado pelo retorno!")}
        />
      )}
    </div>
  );
}
