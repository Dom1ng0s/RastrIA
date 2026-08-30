import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";
import { FieldError } from "../../components/FieldError";
import { PasswordInput } from "../../components/PasswordInput";
import { useAuthStore } from "../../features/auth/store";
import { ROLES } from "../../features/auth/roles";
import { ThemeToggle } from "../../features/theme/ThemeToggle";
import { formatarCpf, validarCpf } from "../../lib/cpf";
import { fieldErrorProps } from "../../lib/fieldA11y";

// Telas do fluxo de acesso alcançáveis só por URL enquanto não há backend.
// Os tokens são os mocks aceitos por PrimeiroAcesso/RedefinirSenha.
const FLUXOS_DEMO = [
  { to: "/onboarding", label: "Onboarding (primeiro login)" },
  { to: "/primeiro-acesso/token-exemplo", label: "Primeiro acesso (definir senha)" },
  { to: "/redefinir-senha/token-exemplo", label: "Redefinir senha (link do e-mail)" },
];

const schema = z.object({
  cpf: z
    .string()
    .min(1, "Informe seu CPF")
    .refine(validarCpf, "CPF inválido"),
  senha: z.string().min(1, "Informe sua senha"),
});

export default function Login() {
  const navigate = useNavigate();
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const [mostrarAtalhoDev, setMostrarAtalhoDev] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    // TODO: substituir por mutation do TanStack Query (POST /api/auth/token/,
    // usando CPF como identificador) quando o endpoint existir. A resposta do
    // backend deve indicar se a senha ainda é temporária — nesse caso, o
    // frontend deve redirecionar para /primeiro-acesso/:token em vez do
    // dashboard, mesmo que a pessoa tenha chegado direto pelo /login (ex: link
    // de ativação perdido). Esse redirecionamento não está implementado aqui,
    // só a tela — depende do backend existir para saber o que responder.
    //
    // Enquanto não há backend de auth, o formulário entra como usuário
    // individual (papel mais comum do login por CPF). Sem popular o store, a
    // proteção de rota (features/auth/RotaProtegida.jsx, issue #61) barraria o
    // /usuario logo em seguida.
    setUsuario({ papel: "usuario", instituicaoId: 1 });
    navigate("/usuario");
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <ThemeToggle className="fixed right-4 top-4 z-20" />
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
          <p className="mb-8 text-sm text-text-muted">Acesse sua conta com seu CPF.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="cpf">
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              autoComplete="username"
              className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
              {...register("cpf", {
                onChange: (event) => setValue("cpf", formatarCpf(event.target.value)),
              })}
              {...fieldErrorProps(errors.cpf, "cpf")}
            />
            <FieldError id="cpf-erro" className="mb-3">
              {errors.cpf?.message}
            </FieldError>

            <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="senha">
              Senha
            </label>
            <PasswordInput
              id="senha"
              autoComplete="current-password"
              className="mb-1"
              {...register("senha")}
              {...fieldErrorProps(errors.senha, "senha")}
            />
            <FieldError id="senha-erro" className="mb-1">
              {errors.senha?.message}
            </FieldError>
            <Link to="/esqueci-senha" className="mb-6 mt-1 block text-right text-xs font-medium text-primary">
              Esqueci minha senha
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Atalho temporário de desenvolvimento — sem backend de autenticação
              real ainda, é a única forma de navegar entre os 4 papéis para
              testar/demonstrar o app. Remover quando o login real acima estiver
              de fato integrado à API. Ver "Estado Atual do Repositório" em
              agents/claude.md. */}
          <div className="mt-8 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => setMostrarAtalhoDev((atual) => !atual)}
              className="text-xs font-medium text-text-muted underline"
            >
              {mostrarAtalhoDev ? "Ocultar" : "Ambiente de testes: entrar direto como..."}
            </button>
            {mostrarAtalhoDev && (
              <div className="mt-3 space-y-2">
                {ROLES.map((papel) => (
                  <button
                    key={papel.id}
                    type="button"
                    onClick={() => {
                      setUsuario({ papel: papel.id, instituicaoId: papel.instituicaoId });
                      navigate(papel.path);
                    }}
                    className="w-full rounded-lg border border-line px-4 py-2 text-left text-xs font-medium text-text-dark hover:bg-bg-tint"
                  >
                    {papel.label}
                  </button>
                ))}

                {/* Telas do fluxo de acesso não têm CTA que leve até elas
                    enquanto não há backend (o login sempre cai no dashboard).
                    Links diretos aqui garantem que essas telas entrem na
                    validação com stakeholders. Remover junto com o atalho de
                    papéis quando o login real existir. */}
                <p className="pt-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  Fluxo de acesso
                </p>
                {FLUXOS_DEMO.map((fluxo) => (
                  <Link
                    key={fluxo.to}
                    to={fluxo.to}
                    className="block w-full rounded-lg border border-line px-4 py-2 text-left text-xs font-medium text-text-dark hover:bg-bg-tint"
                  >
                    {fluxo.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
