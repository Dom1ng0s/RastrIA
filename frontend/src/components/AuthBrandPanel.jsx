import { Link } from "react-router-dom";

import { Logo } from "./Logo";

export function AuthBrandPanel({ heading, subtitle }) {
  return (
    // <aside>: o painel de marca é conteúdo complementar ao formulário (que fica
    // no <main> da tela) — sem landmark, o leitor de tela o deixa "solto" (issue #134).
    <aside aria-label="Sobre a Rastria" className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 md:flex">
      <svg
        data-decorativo
        aria-hidden="true"
        className="pulse-motif absolute inset-0 h-full w-full"
        viewBox="0 0 500 560"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M -20 300 C 40 300 60 260 100 260 C 130 260 140 300 160 300 C 180 300 190 80 220 80 C 250 80 260 460 290 460 C 310 460 320 300 350 300 C 380 300 400 260 520 260"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <Link to="/" className="relative z-10 w-fit">
        <Logo reverse />
      </Link>

      {/* O slogan é <p>, não <h1> (issue #146): o <h1> de cada tela de acesso
          é o objetivo dela ("Entrar", "Redefinir senha"…) e fica no <main> —
          este painel some abaixo do `md`, e com ele sumia o único <h1>. */}
      <div className="relative z-10">
        <p className="mb-3 text-3xl font-semibold leading-tight text-white">{heading}</p>
        <p className="max-w-[280px] text-sm text-[#CFEAE3]">{subtitle}</p>
      </div>
    </aside>
  );
}
