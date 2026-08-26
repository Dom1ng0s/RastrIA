import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";
import { formatarCpf, validarCpf } from "../../lib/cpf";

const schema = z.object({
  cpf: z
    .string()
    .min(1, "Informe seu CPF")
    .refine(validarCpf, "CPF inválido"),
});

export default function EsqueciSenha() {
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    // TODO: substituir por mutation do TanStack Query (POST /api/auth/esqueci-senha).
    // O backend deve responder com sucesso mesmo se o CPF não existir na base,
    // para não revelar quais CPFs estão cadastrados. Envio do link por
    // SMS/WhatsApp ou e-mail institucional, conforme contato cadastrado na
    // planilha de importação (ver "Upload de planilha de integrantes" em
    // agents/claude.md).
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
              <h2 className="mb-1 text-2xl font-semibold text-primary">Verifique seu contato</h2>
              <p className="mb-8 text-sm text-text-muted">
                Se o CPF informado estiver cadastrado, você vai receber um link para redefinir sua
                senha por SMS/WhatsApp ou e-mail institucional em alguns minutos.
              </p>
              <Link to="/login" className="text-sm font-semibold text-primary">
                Voltar para o login
              </Link>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-2xl font-semibold text-primary">Esqueci minha senha</h2>
              <p className="mb-8 text-sm text-text-muted">
                Informe o CPF da sua conta para receber o link de redefinição.
              </p>

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
                />
                {errors.cpf && <p className="mb-3 text-xs text-coral">{errors.cpf.message}</p>}

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
