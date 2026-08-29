import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Logo } from "../../components/Logo";
import { ThemeToggle } from "../../features/theme/ThemeToggle";
import {
  ALTURA_CM_MAX,
  ALTURA_CM_MIN,
  medidasCorporaisSchema,
  PESO_KG_MAX,
  PESO_KG_MIN,
} from "../../lib/medidasCorporais";

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(medidasCorporaisSchema) });

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query (endpoint de perfil do
    // usuário, ainda não definido no backend) quando existir. Onboarding roda
    // no primeiro login de uma conta já provisionada pela instituição (sem
    // autocadastro — ver DOCUMENTACAO.md, seção 16, e agents/claude.md).
    console.log("onboarding", dados);
    navigate("/usuario");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-tint p-6">
      <ThemeToggle className="fixed right-4 top-4 z-20" />
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-sm">
        <Logo className="mb-6" />
        <h2 className="mb-1 text-2xl font-semibold text-primary">Complete seu perfil</h2>
        <p className="mb-6 text-sm text-text-muted">
          Esses dados ajudam a verificação automática dos seus índices.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="pesoKg">
            Peso (kg)
          </label>
          <input
            id="pesoKg"
            type="number"
            step="0.1"
            min={PESO_KG_MIN}
            max={PESO_KG_MAX}
            placeholder="70"
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
            min={ALTURA_CM_MIN}
            max={ALTURA_CM_MAX}
            placeholder="170"
            className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
            {...register("alturaCm")}
          />
          <p className="mb-3 text-xs text-text-muted">Em centímetros, não em metros (ex: 170).</p>
          {errors.alturaCm && <p className="mb-3 text-xs text-coral">{errors.alturaCm.message}</p>}

          {/* Idade não é coletada aqui — vem da data de nascimento cadastrada
              pela instituição na planilha de integrantes (ver "Dados pessoais
              complementares" em agents/claude.md), não é informação que o
              próprio usuário digita. */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary mt-3 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
