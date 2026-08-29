import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";
import { FieldError } from "../../components/FieldError";
import { PasswordInput } from "../../components/PasswordInput";
import { ThemeToggle } from "../../features/theme/ThemeToggle";
import { fieldErrorProps } from "../../lib/fieldA11y";
import { senhaForteSchema } from "../../lib/senha";

const schema = z
  .object({
    senha: senhaForteSchema,
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

// TODO: substituir por consulta real (GET /api/auth/primeiro-acesso/:token/ —
// mesmo endpoint usado pelo primeiro acesso, ver apps/usuarios/views.py) que
// valide o token e confirme que ainda não foi usado nem expirou.
const TOKENS_MOCK = {
  "token-exemplo": { nome: "Soldado João Pereira" },
};

export default function RedefinirSenha() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [concluido, setConcluido] = useState(false);
  const conta = TOKENS_MOCK[token];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    // TODO: substituir por mutation do TanStack Query (POST /api/auth/primeiro-acesso/:token/
    // — mesmo endpoint do primeiro acesso, o mecanismo de token de uso único é
    // o mesmo para as duas situações, só muda o texto da tela).
    setConcluido(true);
  };

  if (!conta) {
    return (
      <div className="grid min-h-screen md:grid-cols-2">
        <ThemeToggle className="fixed right-4 top-4 z-20" />
        <AuthBrandPanel
          heading={<>Link inválido ou expirado.</>}
          subtitle="Solicite um novo link em 'Esqueci minha senha'."
        />
        <div className="flex flex-col justify-center p-10 md:p-14">
          <div className="mx-auto w-full max-w-[360px]">
            <h2 className="mb-1 text-2xl font-semibold text-primary">Link não encontrado</h2>
            <p className="text-sm text-text-muted">
              Este link de redefinição não é válido ou já foi usado. Verifique se copiou o link
              completo, ou solicite um novo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <ThemeToggle className="fixed right-4 top-4 z-20" />
      <AuthBrandPanel
        heading={
          <>
            Vamos definir
            <br />
            sua nova senha.
          </>
        }
        subtitle="Escolha uma senha forte para proteger sua conta."
      />

      <div className="flex flex-col justify-center p-10 md:p-14">
        <div className="mx-auto w-full max-w-[360px]">
          {concluido ? (
            <>
              <h2 className="mb-1 text-2xl font-semibold text-primary">Senha redefinida!</h2>
              <p className="mb-8 text-sm text-text-muted">
                Sua senha foi atualizada. Entre com seu CPF e a nova senha.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold"
              >
                Ir para o login
              </button>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-2xl font-semibold text-primary">Redefinir senha</h2>
              <p className="mb-8 text-sm text-text-muted">Olá, {conta.nome.split(" ")[0]}.</p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="senha">
                  Nova senha
                </label>
                <PasswordInput
                  id="senha"
                  autoComplete="new-password"
                  className="mb-1"
                  {...register("senha")}
                  {...fieldErrorProps(errors.senha, "senha")}
                />
                <FieldError id="senha-erro" className="mb-3">
                  {errors.senha?.message}
                </FieldError>
                <p className="mb-4 text-xs text-text-muted">
                  Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 símbolo.
                </p>

                <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="confirmarSenha">
                  Confirmar senha
                </label>
                <PasswordInput
                  id="confirmarSenha"
                  autoComplete="new-password"
                  className="mb-1"
                  {...register("confirmarSenha")}
                  {...fieldErrorProps(errors.confirmarSenha, "confirmarSenha")}
                />
                <FieldError id="confirmarSenha-erro" className="mb-3">
                  {errors.confirmarSenha?.message}
                </FieldError>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary mt-4 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? "Salvando..." : "Redefinir senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
