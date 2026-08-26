import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";
import { mascararCpf } from "../../lib/cpf";
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

// TODO: substituir por consulta real (GET /api/auth/primeiro-acesso/:token/) que
// valide o token de ativação e retorne nome/CPF da conta provisionada. Token
// expira após uso único ou prazo definido pelo backend — comportamento ainda
// não implementado aqui, só a tela.
const TOKENS_MOCK = {
  "token-exemplo": { nome: "Soldado João Pereira", cpf: "12345678900" },
};

export default function PrimeiroAcesso() {
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
    // TODO: substituir por mutation do TanStack Query (POST /api/auth/primeiro-acesso/:token/)
    // quando o endpoint existir. Ao concluir, o token deve ser invalidado (uso único) —
    // esse controle é responsabilidade do backend, não do frontend.
    setConcluido(true);
  };

  if (!conta) {
    return (
      <div className="grid min-h-screen md:grid-cols-2">
        <AuthBrandPanel
          heading={<>Link inválido ou expirado.</>}
          subtitle="Peça para o responsável pela sua instituição gerar um novo link de ativação."
        />
        <div className="flex flex-col justify-center p-10 md:p-14">
          <div className="mx-auto w-full max-w-[360px]">
            <h2 className="mb-1 text-2xl font-semibold text-primary">Link não encontrado</h2>
            <p className="text-sm text-text-muted">
              Este link de primeiro acesso não é válido. Verifique se copiou o link completo, ou
              solicite um novo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthBrandPanel
        heading={
          <>
            Bem-vindo(a)
            <br />à Rastria.
          </>
        }
        subtitle="Defina sua senha para acessar sua conta pela primeira vez."
      />

      <div className="flex flex-col justify-center p-10 md:p-14">
        <div className="mx-auto w-full max-w-[360px]">
          {concluido ? (
            <>
              <h2 className="mb-1 text-2xl font-semibold text-primary">Senha definida!</h2>
              <p className="mb-8 text-sm text-text-muted">
                Sua conta está pronta. Entre com seu CPF e a senha que você acabou de criar.
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
              <h2 className="mb-1 text-2xl font-semibold text-primary">Primeiro acesso</h2>
              <p className="mb-1 text-sm font-medium text-text-dark">{conta.nome}</p>
              <p className="mb-8 text-sm text-text-muted">CPF {mascararCpf(conta.cpf)}</p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="senha">
                  Nova senha
                </label>
                <input
                  id="senha"
                  type="password"
                  autoComplete="new-password"
                  className="mb-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm"
                  {...register("senha")}
                />
                {errors.senha && <p className="mb-3 text-xs text-coral">{errors.senha.message}</p>}
                <p className="mb-4 text-xs text-text-muted">
                  Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 símbolo.
                </p>

                <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="confirmarSenha">
                  Confirmar senha
                </label>
                <input
                  id="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  className="mb-1 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm"
                  {...register("confirmarSenha")}
                />
                {errors.confirmarSenha && (
                  <p className="mb-3 text-xs text-coral">{errors.confirmarSenha.message}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary mt-4 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? "Salvando..." : "Definir senha e continuar"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
