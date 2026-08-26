import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { DashboardLayout } from "../../components/DashboardLayout";
import { useToast } from "../../features/ui/ToastProvider";

const navItems = [{ to: "/educador-fisico", label: "Painel do Educador Físico", icon: LayoutDashboard }];

// TODO: buscar nome real via GET /api/integrantes/:id quando o endpoint existir.
const NOMES_MOCK = { 1: "Diego Martins", 2: "Juliana Prado" };

// TAF é modelado como tipo estruturado de RegistroSaude com múltiplos componentes
// fixos (corrida, flexão, abdominal, barra) — não como registro de valor único.
// Ver "Reunião com o Coronel Raumário" (issue #7) em agents/claude.md.
const cadastroTafSchema = z.object({
  data: z
    .string()
    .min(1, "Informe a data")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato dd/mm/aaaa"),
  corridaTempo: z.string().min(1, "Informe o tempo da corrida"),
  flexoes: z.coerce.number({ invalid_type_error: "Informe um número" }).int().min(0, "Informe um número válido"),
  abdominais: z.coerce.number({ invalid_type_error: "Informe um número" }).int().min(0, "Informe um número válido"),
  barra: z.coerce.number({ invalid_type_error: "Informe um número" }).int().min(0, "Informe um número válido"),
  resultado: z.enum(["apto", "inapto"], { errorMap: () => ({ message: "Selecione o resultado" }) }),
});

export default function CadastroTAF() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroTafSchema) });

  const nomeAluno = NOMES_MOCK[id] ?? "Aluno";
  const voltarPara = `/educador-fisico/aluno/${id}`;

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query
    // (POST /api/integrantes/:id/taf, tipo="taf", componentes=dados).
    // Critérios de aprovação por idade/sexo são aplicados no backend contra
    // o regulamento da corporação — o campo "resultado" aqui é preenchido
    // manualmente pelo educador físico até essa verificação existir.
    console.log("TAF cadastrado", { alunoId: id, ...dados });
    showToast("TAF cadastrado com sucesso");
    navigate(voltarPara);
  };

  return (
    <DashboardLayout title="Painel do Educador Físico" navItems={navItems}>
      <Link
        to={voltarPara}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <h2 className="mb-1 text-xl font-semibold text-primary">Cadastrar TAF</h2>
      <p className="mb-6 text-sm text-text-muted">{nomeAluno}</p>

      <div className="max-w-[480px] rounded-2xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="data">
            Data do teste
          </label>
          <input
            id="data"
            type="text"
            placeholder="dd/mm/aaaa"
            className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
            {...register("data")}
          />
          {errors.data && <p className="mb-3 text-xs text-coral">{errors.data.message}</p>}

          <div className="mb-1 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="corridaTempo">
                Corrida — tempo
              </label>
              <input
                id="corridaTempo"
                type="text"
                placeholder="Ex: 11min 30s"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
                {...register("corridaTempo")}
              />
              {errors.corridaTempo && <p className="mt-1 text-xs text-coral">{errors.corridaTempo.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="flexoes">
                Flexão — repetições
              </label>
              <input
                id="flexoes"
                type="number"
                min="0"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
                {...register("flexoes")}
              />
              {errors.flexoes && <p className="mt-1 text-xs text-coral">{errors.flexoes.message}</p>}
            </div>
          </div>

          <div className="mb-1 mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="abdominais">
                Abdominal — repetições
              </label>
              <input
                id="abdominais"
                type="number"
                min="0"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
                {...register("abdominais")}
              />
              {errors.abdominais && <p className="mt-1 text-xs text-coral">{errors.abdominais.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="barra">
                Barra — repetições
              </label>
              <input
                id="barra"
                type="number"
                min="0"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
                {...register("barra")}
              />
              {errors.barra && <p className="mt-1 text-xs text-coral">{errors.barra.message}</p>}
            </div>
          </div>

          <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="resultado">
            Resultado
          </label>
          <select
            id="resultado"
            defaultValue=""
            className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
            {...register("resultado")}
          >
            <option value="" disabled>
              Selecione
            </option>
            <option value="apto">Apto</option>
            <option value="inapto">Inapto</option>
          </select>
          {errors.resultado && <p className="mb-3 text-xs text-coral">{errors.resultado.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary mt-6 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Salvar TAF"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
