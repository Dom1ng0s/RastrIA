import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard, Stethoscope, ToggleLeft, ToggleRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { DashboardLayout } from "../../components/DashboardLayout";
import { useConsentimentoStore } from "../../features/consentimento/store";
import { useRankingPrefsStore } from "../../features/ranking/store";

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
  idade: z.coerce
    .number({ invalid_type_error: "Informe um número" })
    .int("Informe um número inteiro")
    .positive("Informe uma idade válida"),
});

// TODO: substituir por dado real via TanStack Query (GET /api/usuarios/me) quando
// o endpoint existir — hoje reflete só o que foi digitado no Onboarding.
const dadosMock = { email: "usuario@rastria.app", pesoKg: 70, alturaCm: 170, idade: 30 };

export default function Perfil() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(perfilSchema), defaultValues: dadosMock });

  const optedOutDoRanking = useRankingPrefsStore((state) => state.optedOut);
  const toggleOptOutDoRanking = useRankingPrefsStore((state) => state.toggleOptOut);
  const consentimento = useConsentimentoStore((state) => state.consentimento);

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query (PATCH /api/usuarios/me).
    console.log("perfil atualizado", dados);
  };

  return (
    <DashboardLayout title="Perfil" navItems={navItems}>
      <div className="max-w-[400px] rounded-2xl border border-line bg-white p-7">
        <label className="mb-1.5 block text-xs font-medium text-text-dark">E-mail</label>
        <p className="mb-5 text-sm text-text-muted">{dadosMock.email}</p>

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
          {errors.alturaCm && <p className="mb-3 text-xs text-coral">{errors.alturaCm.message}</p>}

          <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="idade">
            Idade
          </label>
          <input
            id="idade"
            type="number"
            className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
            {...register("idade")}
          />
          {errors.idade && <p className="mb-4 text-xs text-coral">{errors.idade.message}</p>}

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
