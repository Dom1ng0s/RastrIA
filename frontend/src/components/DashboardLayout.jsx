import { Flag, HelpCircle, ListChecks, LogOut, Menu, Settings, Compass, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAcessibilidadeStore } from "../features/acessibilidade/store";
import { useAuthStore } from "../features/auth/store";
import { PAPEL_PADRAO } from "../features/auth/navPorPapel";
import { useToast } from "../features/ui/ToastProvider";
import { useTituloPagina } from "../lib/tituloPagina";
import { ThemeToggle } from "../features/theme/ThemeToggle";

import { ConteudoPrincipal } from "./ConteudoPrincipal";
import { Logo } from "./Logo";
import { NotificacoesMenu } from "./NotificacoesMenu";
import { ReportarProblemaModal } from "./ReportarProblemaModal";

// Ícone de ajuda expandido (issue #91): além de reabrir o tour guiado, oferece
// um atalho para as perguntas frequentes (seção pública `/#faq` da Landing).
function HelpMenu({ onRever }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

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
        aria-label="Ajuda"
        title="Ajuda"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className="inline-flex h-5 w-5 items-center justify-center text-text-muted hover:text-primary"
      >
        <HelpCircle size={20} />
      </button>
      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAberto(false);
              onRever?.();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-dark hover:bg-bg-tint"
          >
            <Compass size={15} /> Rever tour guiado
          </button>
          <a
            role="menuitem"
            href="/#faq"
            onClick={() => setAberto(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-dark hover:bg-bg-tint"
          >
            <ListChecks size={15} /> Ver perguntas frequentes
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
export function DashboardLayout({ title, paginaAtual, navItems, children, onHelp }) {
  useTituloPagina(paginaAtual, title);
  const location = useLocation();
  useRolarParaSecao(location.hash);
  const [menuAberto, setMenuAberto] = useState(false);
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

      {/* Gaveta mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-primary/40"
          />
          <aside className="relative flex h-full w-64 flex-col justify-between bg-primary p-6">
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuAberto(false)}
              className="absolute right-4 top-4 text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent
              navItems={navItems}
              location={location}
              onNavigate={() => setMenuAberto(false)}
              onReportarProblema={() => setReportarAberto(true)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 bg-bg-tint">
        <header className="flex items-center gap-3 border-b border-line bg-white px-5 py-5 md:px-8">
          <button
            type="button"
            aria-label="Abrir menu"
            data-abrir-menu
            onClick={() => setMenuAberto(true)}
            className="text-primary md:hidden"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-xl font-semibold text-primary">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
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
