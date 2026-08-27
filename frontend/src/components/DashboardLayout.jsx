import { HelpCircle, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { ThemeToggle } from "../features/theme/ThemeToggle";

import { Logo } from "./Logo";

function SidebarContent({ navItems, location, navigate, onNavigate }) {
  return (
    <>
      <div>
        <Logo reverse className="mb-10" />
        <nav className="space-y-1">
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
          className={`nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
            location.pathname === "/perfil" ? "active" : ""
          }`}
        >
          <User size={18} />
          Perfil
        </Link>
        {/* TODO: limpar sessão real (tokens/store de auth) quando login real existir */}
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            navigate("/login");
          }}
          className="nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </>
  );
}

export function DashboardLayout({ title, navItems, children, onHelp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa — telas médias/grandes */}
      <aside className="hidden w-64 flex-shrink-0 flex-col justify-between bg-primary p-6 md:flex">
        <SidebarContent navItems={navItems} location={location} navigate={navigate} />
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
              navigate={navigate}
              onNavigate={() => setMenuAberto(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 bg-bg-tint">
        <header className="flex items-center gap-3 border-b border-line bg-white px-5 py-5 md:px-8">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMenuAberto(true)}
            className="text-primary md:hidden"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-xl font-semibold text-primary">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            {onHelp && (
              <button
                type="button"
                aria-label="Ver tour guiado"
                title="Ver tour guiado"
                onClick={onHelp}
                className="text-text-muted hover:text-primary"
              >
                <HelpCircle size={20} />
              </button>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
