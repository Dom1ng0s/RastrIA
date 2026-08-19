import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Logo } from "../../components/Logo";

const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe sua senha"),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query chamando POST
    // /api/auth/token/ (ver src/lib/api.js) e guardando o par de tokens.
    console.log("login", dados);
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
        <div className="mx-auto w-full max-w-[320px]">
          <h2 className="mb-1 text-2xl font-semibold text-primary">Entrar</h2>
          <p className="mb-8 text-sm text-text-muted">Acesse seu histórico de saúde.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              className="mb-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm"
              {...register("email")}
            />
            {errors.email && <p className="mb-3 text-xs text-coral">{errors.email.message}</p>}

            <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="mb-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm"
              {...register("senha")}
            />
            {errors.senha && <p className="mb-2 text-xs text-coral">{errors.senha.message}</p>}

            {/* TODO: vira rota /esqueci-senha quando essa tela existir */}
            <a href="#" className="mb-6 block text-right text-xs font-medium text-seafoam">
              Esqueci minha senha
            </a>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary mb-4 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted">
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
