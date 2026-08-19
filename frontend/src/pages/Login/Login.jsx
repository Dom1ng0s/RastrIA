import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Logo } from "../../components/Logo";
import { ROLES } from "../../features/auth/roles";

export default function Login() {
  const [papelSelecionado, setPapelSelecionado] = useState(null);
  const navigate = useNavigate();

  const entrar = () => {
    const papel = ROLES.find((r) => r.id === papelSelecionado);
    if (papel) navigate(papel.path);
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 md:flex">
        <svg
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

        <Logo reverse className="relative z-10" />

        <div className="relative z-10">
          <h1 className="mb-3 text-3xl font-semibold leading-tight text-white">
            Seu histórico de
            <br />
            saúde, sempre com
            <br />
            você.
          </h1>
          <p className="max-w-[280px] text-sm text-[#CFEAE3]">
            Cadastre exames, acompanhe seus índices e conecte-se a profissionais quando precisar.
          </p>
        </div>

        <p className="relative z-10 text-xs text-[#9FCFC4]">Programa Centelha 3 · Alagoas</p>
      </div>

      <div className="flex flex-col justify-center p-10 md:p-14">
        <div className="mx-auto w-full max-w-[360px]">
          <h2 className="mb-1 text-2xl font-semibold text-primary">Entrar</h2>
          {/* TODO: autenticação real (JWT contra POST /api/auth/token/) ainda não
              existe — a seleção de papel abaixo só redireciona para a tela inicial
              correspondente. Ver "Estado Atual do Repositório" em agents/claude.md. */}
          <p className="mb-8 text-sm text-text-muted">Escolha como você quer entrar.</p>

          <div className="mb-6 space-y-2">
            {ROLES.map((papel) => (
              <button
                key={papel.id}
                type="button"
                onClick={() => setPapelSelecionado(papel.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  papelSelecionado === papel.id
                    ? "border-primary bg-bg-tint text-primary"
                    : "border-line text-text-dark hover:bg-bg-tint"
                }`}
              >
                {papel.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!papelSelecionado}
            onClick={entrar}
            className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            Entrar
          </button>

          <p className="mt-6 text-center text-sm text-text-muted">
            Não tem conta?{" "}
            {/* TODO: vira rota /cadastro quando essa tela existir */}
            <a href="#" className="font-semibold text-primary">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
