import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { DashboardLayout } from "../../components/DashboardLayout";
import { FieldError } from "../../components/FieldError";
import { ForcaSenha } from "../../components/ForcaSenha";
import { PasswordInput } from "../../components/PasswordInput";
import { useAuthStore } from "../../features/auth/store";
import { navItemsDoPapel, PAPEL_PADRAO } from "../../features/auth/navPorPapel";
import { useToast } from "../../features/ui/ToastProvider";
import { fieldErrorProps } from "../../lib/fieldA11y";
import { senhaForteSchema } from "../../lib/senha";

// Tela própria de troca de senha (issue #88) — antes era um card embutido inline
// no Perfil. Alcançável pelo botão "Alterar senha" da seção "Editar perfil" de
// Configurações, na rota /perfil/alterar-senha.

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

export default function AlterarSenha() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const papel = useAuthStore((state) => state.usuario?.papel) ?? PAPEL_PADRAO;
  const navItems = navItemsDoPapel(papel);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(trocarSenhaSchema) });

  const novaSenhaDigitada = watch("novaSenha") ?? "";

  const onSubmit = async () => {
    // TODO: substituir por mutation do TanStack Query, enviando
    // { senha_atual, nova_senha } para POST /api/auth/trocar-senha/. O endpoint
    // ainda não existe no backend (ver apps/usuarios/views.py) — o mecanismo de
    // troca é o mesmo do primeiro acesso/redefinição, só que autenticado e
    // exigindo a senha atual. Em caso de 400 (senha atual incorreta), reportar
    // no próprio campo "Senha atual" (react-hook-form setError), não num toast.
    showToast("Senha alterada");
    navigate("/perfil");
  };

  return (
    <DashboardLayout title="Alterar senha" navItems={navItems}>
      <Link
        to="/perfil"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
      >
        <ArrowLeft size={16} /> Voltar para Configurações
      </Link>

      <div className="max-w-[400px] rounded-2xl border border-line bg-white p-7">
        <p className="mb-4 text-xs text-text-muted">
          Escolha uma senha forte para proteger sua conta. Você continuará conectado neste dispositivo.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="senhaAtual">
            Senha atual
          </label>
          <PasswordInput
            id="senhaAtual"
            autoComplete="current-password"
            className="mb-1"
            {...register("senhaAtual")}
            {...fieldErrorProps(errors.senhaAtual, "senhaAtual")}
          />
          <FieldError id="senhaAtual-erro" className="mb-3">
            {errors.senhaAtual?.message}
          </FieldError>

          <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="novaSenha">
            Nova senha
          </label>
          <PasswordInput
            id="novaSenha"
            autoComplete="new-password"
            className="mb-1"
            {...register("novaSenha")}
            aria-invalid={errors.novaSenha ? true : undefined}
            aria-describedby={`novaSenha-dica${errors.novaSenha ? " novaSenha-erro" : ""}`}
          />
          <FieldError id="novaSenha-erro" className="mb-1">
            {errors.novaSenha?.message}
          </FieldError>
          <ForcaSenha senha={novaSenhaDigitada} id="novaSenha-dica" />

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
            {...register("confirmarNovaSenha")}
            {...fieldErrorProps(errors.confirmarNovaSenha, "confirmarNovaSenha")}
          />
          <FieldError id="confirmarNovaSenha-erro" className="mb-3">
            {errors.confirmarNovaSenha?.message}
          </FieldError>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary mt-3 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            {isSubmitting ? "Salvando..." : "Trocar senha"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
