import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
});

export default function EsqueciSenha() {
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    // TODO: substituir por mutation do TanStack Query (POST /api/auth/esqueci-senha).
    // O backend deve responder com sucesso mesmo se o e-mail não existir na
    // base, para não revelar quais e-mails estão cadastrados. Ao encontrar
    // a conta, gera um TokenAtivacao (mesmo mecanismo do primeiro acesso —
    // ver PrimeiroAcesso.jsx e apps/usuarios/models.py) e envia o link para
    // /redefinir-senha/:token por e-mail.
    setEnviado(true);
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthBrandPanel
        heading={
          <>
            Vamos recuperar
            <br />
            seu acesso.
          </>
        }
        subtitle="Enviamos um link seguro para redefinir sua senha."
      />

      <div className="flex flex-col justify-center p-10 md:p-14">
        <div className="mx-auto w-full max-w-[360px]">
          {enviado ? (
            <>
              <h2 className="mb-1 text-2xl font-semibold text-primary">Verifique seu e-mail</h2>
              <p className="mb-8 text-sm text-text-muted">
                Se o e-mail informado estiver cadastrado, você vai receber um link para redefinir
                sua senha em alguns minutos.
              </p>
              <Link to="/login" className="text-sm font-semibold text-primary">
                Voltar para o login
              </Link>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-2xl font-semibold text-primary">Esqueci minha senha</h2>
              <p className="mb-8 text-sm text-text-muted">
                Informe o e-mail cadastrado na sua conta para receber o link de redefinição.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="voce@email.com"
                  autoComplete="email"
                  className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
                  {...register("email")}
                />
                {errors.email && <p className="mb-3 text-xs text-coral">{errors.email.message}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary mt-4 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-text-muted">
                Lembrou a senha?{" "}
                <Link to="/login" className="font-semibold text-primary">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
