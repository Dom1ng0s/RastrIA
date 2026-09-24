import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { AuthBrandPanel } from "../../components/AuthBrandPanel";
import { AvisoObrigatorios, MarcaObrigatorio } from "../../components/CampoObrigatorio";
import { ConteudoPrincipal } from "../../components/ConteudoPrincipal";
import { FieldError } from "../../components/FieldError";
import { PasswordInput } from "../../components/PasswordInput";
import {
  esquecerSessaoExpirada,
  MINUTOS_LIMITE_SESSAO,
  sessaoExpirouPorInatividade,
} from "../../features/auth/SessaoInativa";
import { useAuthStore } from "../../features/auth/store";
import { ROLES } from "../../features/auth/roles";
import { MODO_DEMO } from "../../features/demo/flag";
import { ThemeToggle } from "../../features/theme/ThemeToggle";
import { formatarCpf, validarCpf } from "../../lib/cpf";
import { fieldErrorProps } from "../../lib/fieldA11y";
import { useTituloPagina } from "../../lib/tituloPagina";

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
  useTituloPagina("Entrar");
  const navigate = useNavigate();
  // Vindo do encerramento por inatividade (features/auth/SessaoInativa.jsx,
  // #143): explica o motivo na própria tela, não num aviso que some. Lido no
  // estado inicial e apagado num efeito — assim o StrictMode (que chama o
  // inicializador duas vezes) não perde a marca, e um reload não repete a
  // mensagem.
  const [sessaoExpirada] = useState(sessaoExpirouPorInatividade);
  useEffect(() => esquecerSessaoExpirada(), []);
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
    //
    // Ao implementar o redirect "voltar pra rota tentada antes de logar"
    // (location.state.from, guardado pela RotaProtegida), passar o `from` por
    // `rotaInternaSegura` (lib/rotaInterna.js) antes de navegar — um `from`
    // manipulado com "//" ou "/\" redirecionaria pra domínio externo
    // (open redirect, issue #107).
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

      <ConteudoPrincipal className="flex flex-col justify-center p-10 md:p-14">
        <div className="mx-auto w-full max-w-[360px]">
          <h1 className="mb-1 text-2xl font-semibold text-primary">Entrar</h1>
          <p className="mb-8 text-sm text-text-muted">Acesse sua conta com seu CPF.</p>

          {/* role="alert": é lido quando aparece, sem depender de onde está o
              foco (a troca de página leva o foco ao título, #135). */}
          {sessaoExpirada && (
            <p role="alert" className="badge-atencao mb-6 rounded-lg px-4 py-3 text-sm">
              Sua sessão foi encerrada após {MINUTOS_LIMITE_SESSAO} minutos sem atividade. Entre de novo
              para continuar.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AvisoObrigatorios />
            <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="cpf">
              CPF <MarcaObrigatorio />
            </label>
            <input
              id="cpf"
              aria-required="true"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              autoComplete="username"
              className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
              {...register("cpf", {
                onChange: (event) => setValue("cpf", formatarCpf(event.target.value)),
              })}
              {...fieldErrorProps(errors.cpf, "cpf", { dica: true })}
            />
            {/* Formato fora do placeholder, que some ao digitar (issue #147). */}
            <p id="cpf-dica" className="mb-1 text-xs text-text-muted">
              Os 11 números — os pontos e o traço entram sozinhos.
            </p>
            <FieldError id="cpf-erro" className="mb-3">
              {errors.cpf?.message}
            </FieldError>

            <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="senha">
              Senha <MarcaObrigatorio />
            </label>
            <PasswordInput
              id="senha"
              aria-required="true"
              autoComplete="current-password"
              className="mb-1"
              {...register("senha")}
              {...fieldErrorProps(errors.senha, "senha")}
            />
            <FieldError id="senha-erro" className="mb-1">
              {errors.senha?.message}
            </FieldError>
            <Link to="/esqueci-senha" className="mb-5 ml-auto block w-fit py-1.5 text-right text-xs font-medium text-primary">
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
              testar/demonstrar o app.

              Ele define papel e navega para o dashboard SEM credencial
              nenhuma: hoje é inofensivo (não há autenticação nem dado real a
              proteger), mas no dia em que a API entrar vira um bypass de
              autenticação e de papel numa tela pública. Por isso fica atrás de
              `VITE_MODO_DEMO` (issue #128), que já mantém o build de
              piloto/produção limpo.

              A flag reduz a exposição, não substitui a remoção: o bloco deve
              sair de vez quando o login acima estiver de fato integrado à API.
              Ver "Estado Atual do Repositório" em agents/claude.md. */}
          {MODO_DEMO && (
          <div className="mt-8 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => setMostrarAtalhoDev((atual) => !atual)}
              className="py-1.5 text-xs font-medium text-text-muted underline"
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
                <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
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
          )}
        </div>
      </ConteudoPrincipal>
    </div>
  );
}
