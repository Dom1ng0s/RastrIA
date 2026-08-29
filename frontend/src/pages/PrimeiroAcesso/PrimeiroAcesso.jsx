import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";
import { FieldError } from "../../components/FieldError";
import { PasswordInput } from "../../components/PasswordInput";
import { TermoConsentimentoLGPD } from "../../components/TermoConsentimentoLGPD";
import { useConsentimentoStore } from "../../features/consentimento/store";
import { ThemeToggle } from "../../features/theme/ThemeToggle";
import { mascararCpf } from "../../lib/cpf";
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

// TODO: substituir por consulta real (GET /api/auth/primeiro-acesso/:token/) que
// valide o token de ativação e retorne nome/CPF da conta provisionada. Token
// expira após uso único ou prazo definido pelo backend — comportamento ainda
// não implementado aqui, só a tela.
const TOKENS_MOCK = {
  "token-exemplo": { nome: "Soldado João Pereira", cpf: "12345678900" },
};

// Fluxo de primeiro acesso em 3 passos, sem telas separadas: definir senha →
// consentimento LGPD → concluído. O consentimento entra aqui (não depois, como
// tela avulsa) por decisão de desenho da issue "Tela de consentimento LGPD no
// primeiro acesso" — mesmo fluxo da troca de senha obrigatória.
const PASSO_SENHA = "senha";
const PASSO_CONSENTIMENTO = "consentimento";
const PASSO_CONCLUIDO = "concluido";

export default function PrimeiroAcesso() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passo, setPasso] = useState(PASSO_SENHA);
  const [aceiteMarcado, setAceiteMarcado] = useState(false);
  const conta = TOKENS_MOCK[token];
  const registrarAceite = useConsentimentoStore((state) => state.registrarAceite);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmitSenha = async () => {
    // TODO: substituir por mutation do TanStack Query (POST /api/auth/primeiro-acesso/:token/)
    // quando o endpoint existir. Ao concluir, o token deve ser invalidado (uso único) —
    // esse controle é responsabilidade do backend, não do frontend.
    setPasso(PASSO_CONSENTIMENTO);
  };

  const onAceitarTermo = () => {
    if (!aceiteMarcado) return;
    // TODO: o registro do aceite deve virar parte da mesma mutation de
    // primeiro acesso no backend (POST /api/auth/primeiro-acesso/:token/),
    // gravando quem aceitou, quando e qual versão do termo. Hoje é só
    // client-side (ver features/consentimento/store.js).
    registrarAceite();
    setPasso(PASSO_CONCLUIDO);
  };

  if (!conta) {
    return (
      <div className="grid min-h-screen md:grid-cols-2">
        <ThemeToggle className="fixed right-4 top-4 z-20" />
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
      <ThemeToggle className="fixed right-4 top-4 z-20" />
      <AuthBrandPanel
        heading={
          <>
            Bem-vindo(a)
            <br />à Rastria.
          </>
        }
        subtitle={
          passo === PASSO_CONSENTIMENTO
            ? "Antes de continuar, leia o termo de consentimento sobre o uso dos seus dados."
            : "Defina sua senha para acessar sua conta pela primeira vez."
        }
      />

      <div className="flex flex-col justify-center p-10 md:p-14">
        <div className={`mx-auto w-full ${passo === PASSO_CONSENTIMENTO ? "max-w-[480px]" : "max-w-[360px]"}`}>
          {passo === PASSO_CONCLUIDO && (
            <>
              <h2 className="mb-1 text-2xl font-semibold text-primary">Tudo pronto!</h2>
              <p className="mb-8 text-sm text-text-muted">
                Sua senha foi definida e o consentimento registrado. Entre com seu CPF e a senha
                que você acabou de criar.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold"
              >
                Ir para o login
              </button>
            </>
          )}

          {passo === PASSO_SENHA && (
            <>
              <h2 className="mb-1 text-2xl font-semibold text-primary">Primeiro acesso</h2>
              <p className="mb-1 text-sm font-medium text-text-dark">{conta.nome}</p>
              <p className="mb-8 text-sm text-text-muted">CPF {mascararCpf(conta.cpf)}</p>

              <form onSubmit={handleSubmit(onSubmitSenha)} noValidate>
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
                  {isSubmitting ? "Salvando..." : "Continuar"}
                </button>
              </form>
            </>
          )}

          {passo === PASSO_CONSENTIMENTO && (
            <>
              <h2 className="mb-4 text-2xl font-semibold text-primary">Consentimento LGPD</h2>

              <div className="mb-4 max-h-[360px] overflow-y-auto rounded-lg border border-line p-4">
                <TermoConsentimentoLGPD />
              </div>

              <label className="mb-4 flex items-start gap-2 text-xs text-text-dark">
                <input
                  type="checkbox"
                  checked={aceiteMarcado}
                  onChange={(evento) => setAceiteMarcado(evento.target.checked)}
                  className="mt-0.5"
                />
                Li e estou ciente de como meus dados serão tratados, conforme descrito acima.
              </label>

              <button
                type="button"
                disabled={!aceiteMarcado}
                onClick={onAceitarTermo}
                className="btn-primary w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                Aceitar e concluir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
