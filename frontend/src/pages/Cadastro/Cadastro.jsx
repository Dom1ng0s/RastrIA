import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";

const cadastroSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
  codigoCorporacao: z
    .string()
    .length(6, "O código da corporação tem 6 dígitos")
    .regex(/^\d{6}$/, "O código da corporação tem apenas números"),
});

export default function Cadastro() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroSchema) });

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query chamando POST /api/usuarios/
    // (cria Usuario com papel=individual + VinculoInstituicao a partir do código da
    // corporação). Ver nota abaixo: o papel inicial é sempre "usuario" — quem
    // atribui o cargo real depois é o Comando da instituição, não este formulário.
    console.log("cadastro", dados);
    navigate("/onboarding");
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthBrandPanel
        heading={
          <>
            Comece a organizar
            <br />
            sua saúde
            <br />
            hoje mesmo.
          </>
        }
        subtitle="Centralize seus exames, acompanhe seus índices e conecte-se a profissionais qualificados."
      />

      <div className="flex flex-col justify-center p-10 md:p-14">
        <div className="mx-auto w-full max-w-[360px]">
          <h2 className="mb-1 text-2xl font-semibold text-primary">Criar conta</h2>
          <p className="mb-6 text-sm text-text-muted">Leva menos de um minuto.</p>

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
              autoComplete="new-password"
              placeholder="••••••••"
              className="mb-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm"
              {...register("senha")}
            />
            {errors.senha && <p className="mb-3 text-xs text-coral">{errors.senha.message}</p>}

            <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="codigoCorporacao">
              Código da corporação
            </label>
            <input
              id="codigoCorporacao"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="mb-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm tracking-[0.3em]"
              {...register("codigoCorporacao")}
            />
            {errors.codigoCorporacao && (
              <p className="mb-1 text-xs text-coral">{errors.codigoCorporacao.message}</p>
            )}
            <p className="mb-6 text-xs text-text-muted">
              Código de 6 dígitos fornecido pela sua instituição, usado para identificar seu grupo.
            </p>

            <div className="mb-6 rounded-lg bg-bg-tint p-3 text-xs text-text-muted">
              Depois de criar sua conta, o Comando da sua instituição vai indicar seu cargo
              (médico, educador físico, integrante etc). Por enquanto, sua conta é criada
              apenas como <strong className="text-text-dark">Usuário</strong>.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Já tem conta?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
