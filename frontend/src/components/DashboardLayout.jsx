import { LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Logo } from "./Logo";

export function DashboardLayout({ title, navItems, children }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-shrink-0 flex-col justify-between bg-primary p-6">
        <div>
          <Logo reverse className="mb-10" />
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
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

        {/* TODO: limpar sessão real (tokens/store de auth) quando login real existir */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium"
        >
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <div className="flex-1 bg-bg-tint">
        <header className="border-b border-line bg-white px-8 py-5">
          <h1 className="text-xl font-semibold text-primary">{title}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
