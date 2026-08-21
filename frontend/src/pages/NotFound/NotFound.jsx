import { Home } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "../../components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-tint px-6 text-center">
      <Logo className="mb-10" />
      <span className="mb-2 font-heading text-6xl font-semibold text-primary">404</span>
      <h1 className="mb-2 text-xl font-semibold text-primary">Página não encontrada</h1>
      <p className="mb-8 max-w-[360px] text-sm text-text-muted">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="btn-primary flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
      >
        <Home size={16} />
        Voltar para o início
      </Link>
    </div>
  );
}
