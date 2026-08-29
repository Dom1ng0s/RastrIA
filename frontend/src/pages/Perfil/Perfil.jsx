import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard, Stethoscope, ToggleLeft, ToggleRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { DashboardLayout } from "../../components/DashboardLayout";
import { PasswordInput } from "../../components/PasswordInput";
import { useConsentimentoStore } from "../../features/consentimento/store";
import { useRankingPrefsStore } from "../../features/ranking/store";
import { useToast } from "../../features/ui/ToastProvider";
import { calcularIdade, formatarDataNascimento } from "../../lib/dataNascimento";
import { senhaForteSchema } from "../../lib/senha";

// TODO: navItems assume o contexto de "usuário individual". Quando existir
// autenticação real, derivar dinamicamente pelo papel logado — Perfil é
// acessado por todos os papéis (médico, educador físico, gerente, usuário).
const navItems = [
  { to: "/usuario", label: "Meu Histórico", icon: LayoutDashboard },
  { to: "/usuario/solicitar", label: "Solicitar Acompanhamento", icon: Stethoscope },
];

const perfilSchema = z.object({
  pesoKg: z.coerce.number({ invalid_type_error: "Informe um número" }).positive("Informe um peso válido"),
  alturaCm: z.coerce.number({ invalid_type_error: "Informe um número" }).positive("Informe uma altura válida"),
});

// `senhaForteSchema` (lib/senha.js) é a mesma regra do primeiro acesso e da
// redefinição por token — reaproveitada aqui para a troca voluntária de senha.
const trocarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe sua senha atual"),
    novaSenha: senhaForteSchema,
    confirmarNovaSenha: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((dados) => dados.novaSenha === dados.confirmarNovaSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarNovaSenha"],
  })
  .refine((dados) => dados.novaSenha !== dados.senhaAtual, {
    message: "A nova senha deve ser diferente da atual",
    path: ["novaSenha"],
  });

// A idade deriva da data de nascimento (fonte da verdade: planilha de
// integrantes da instituição), nunca de um número digitado à mão que
// desatualiza a cada aniversário. Cálculo e formatação em lib/dataNascimento.

// TODO: substituir por dado real via TanStack Query (GET /api/usuarios/me) quando
// o endpoint existir. `dataNascimento` vem da planilha de integrantes importada
// pela instituição (ver "Dados pessoais complementares" em agents/claude.md) —
// não é preenchida pelo usuário, por isso não aparece no formulário abaixo.
const dadosMock = { email: "usuario@rastria.app", dataNascimento: "1996-03-15", pesoKg: 70, alturaCm: 170 };

export default function Perfil() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(perfilSchema), defaultValues: dadosMock });

  const {
    register: registerSenha,
    handleSubmit: handleSubmitSenha,
    reset: resetSenha,
    formState: { errors: errosSenha, isSubmitting: enviandoSenha },
  } = useForm({ resolver: zodResolver(trocarSenhaSchema) });

  const optedOutDoRanking = useRankingPrefsStore((state) => state.optedOut);
  const toggleOptOutDoRanking = useRankingPrefsStore((state) => state.toggleOptOut);
  const consentimento = useConsentimentoStore((state) => state.consentimento);
  const { showToast } = useToast();

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query (PATCH /api/usuarios/me).
    console.log("perfil atualizado", dados);
    showToast("Alterações salvas");
    // Zera o isDirty: os valores salvos passam a ser o novo baseline do form.
    reset(dados);
  };

  const onTrocarSenha = async () => {
    // TODO: substituir por mutation do TanStack Query, enviando
    // { senha_atual, nova_senha } para POST /api/auth/trocar-senha/. O endpoint
    // ainda não existe no backend (ver apps/usuarios/views.py) — o mecanismo de
    // troca é o mesmo do primeiro acesso/redefinição, só que autenticado e
    // exigindo a senha atual. Em caso de 400 (senha atual incorreta), reportar
    // no próprio campo "Senha atual" (react-hook-form setError), não num toast.
    showToast("Senha alterada");
    resetSenha();
  };

  return (
    <DashboardLayout title="Perfil" navItems={navItems}>
      <div className="max-w-[400px] rounded-2xl border border-line bg-white p-7">
        <label className="mb-1.5 block text-xs font-medium text-text-dark">E-mail</label>
        <p className="mb-5 text-sm text-text-muted">{dadosMock.email}</p>

        <label className="mb-1.5 block text-xs font-medium text-text-dark">Data de nascimento</label>
        <p className="mb-5 text-sm text-text-muted">
          {formatarDataNascimento(dadosMock.dataNascimento)} · {calcularIdade(dadosMock.dataNascimento)} anos
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="pesoKg">
            Peso (kg)
          </label>
          <input
            id="pesoKg"
            type="number"
            step="0.1"
            className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
            {...register("pesoKg")}
          />
          {errors.pesoKg && <p className="mb-3 text-xs text-coral">{errors.pesoKg.message}</p>}

          <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="alturaCm">
            Altura (cm)
          </label>
          <input
            id="alturaCm"
            type="number"
            className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
            {...register("alturaCm")}
          />
          {errors.alturaCm && <p className="mb-4 text-xs text-coral">{errors.alturaCm.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="btn-primary mt-3 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>

      <div className="mt-6 max-w-[400px] rounded-2xl border border-line bg-white p-7">
        <h2 className="mb-1 text-sm font-semibold text-text-dark">Trocar senha</h2>
        <p className="mb-4 text-xs text-text-muted">
          Escolha uma senha forte para proteger sua conta. Você continuará conectado neste dispositivo.
        </p>

        <form onSubmit={handleSubmitSenha(onTrocarSenha)} noValidate>
          <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="senhaAtual">
            Senha atual
          </label>
          <PasswordInput
            id="senhaAtual"
            autoComplete="current-password"
            className="mb-1"
            {...registerSenha("senhaAtual")}
          />
          {errosSenha.senhaAtual && (
            <p className="mb-3 text-xs text-coral">{errosSenha.senhaAtual.message}</p>
          )}

          <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="novaSenha">
            Nova senha
          </label>
          <PasswordInput
            id="novaSenha"
            autoComplete="new-password"
            className="mb-1"
            {...registerSenha("novaSenha")}
          />
          {errosSenha.novaSenha && (
            <p className="mb-1 text-xs text-coral">{errosSenha.novaSenha.message}</p>
          )}
          <p className="mb-3 text-xs text-text-muted">
            Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 símbolo.
          </p>

          <label
            className="mb-1.5 block text-xs font-medium text-text-dark"
            htmlFor="confirmarNovaSenha"
          >
            Confirmar nova senha
          </label>
          <PasswordInput
            id="confirmarNovaSenha"
            autoComplete="new-password"
            className="mb-1"
            {...registerSenha("confirmarNovaSenha")}
          />
          {errosSenha.confirmarNovaSenha && (
            <p className="mb-3 text-xs text-coral">{errosSenha.confirmarNovaSenha.message}</p>
          )}

          <button
            type="submit"
            disabled={enviandoSenha}
            className="btn-primary mt-3 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            {enviandoSenha ? "Salvando..." : "Trocar senha"}
          </button>
        </form>
      </div>

      <div className="mt-6 max-w-[400px] rounded-2xl border border-line bg-white p-7">
        <h2 className="mb-1 text-sm font-semibold text-text-dark">Ranking de desempenho físico</h2>
        <p className="mb-4 text-xs text-text-muted">
          O ranking mostra seu nome, restrito a integrantes da sua instituição. Você pode optar por
          não aparecer nele a qualquer momento.
        </p>
        <button
          type="button"
          onClick={toggleOptOutDoRanking}
          className="flex w-full items-center justify-between rounded-lg border border-line px-4 py-3 text-sm font-medium hover:bg-bg-tint"
        >
          <span>Aparecer no ranking</span>
          {optedOutDoRanking ? (
            <ToggleLeft size={28} className="text-text-muted" />
          ) : (
            <ToggleRight size={28} className="text-seafoam" />
          )}
        </button>
      </div>

      <div className="mt-6 max-w-[400px] rounded-2xl border border-line bg-white p-7">
        <h2 className="mb-1 text-sm font-semibold text-text-dark">Consentimento LGPD</h2>
        <p className="mb-4 text-xs text-text-muted">
          {consentimento
            ? "Termo aceito no primeiro acesso. O aceite não pode ser revogado, mas você pode consultar o conteúdo do termo a qualquer momento."
            : "Nenhum registro de aceite encontrado nesta conta."}
        </p>
        <Link
          to="/perfil/termo-consentimento"
          className="btn-outline block w-full rounded-lg py-2.5 text-center text-sm font-semibold"
        >
          Consultar termo aceito
        </Link>
      </div>
    </DashboardLayout>
  );
}
