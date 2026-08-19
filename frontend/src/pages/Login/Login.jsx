import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";
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
      <AuthBrandPanel
        heading={
          <>
            Seu histórico de
            <br />
            saúde, sempre com
            <br />
            você.
          </>
        }
        subtitle="Cadastre exames, acompanhe seus índices e conecte-se a profissionais quando precisar."
      />

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
            <Link to="/cadastro" className="font-semibold text-primary">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
