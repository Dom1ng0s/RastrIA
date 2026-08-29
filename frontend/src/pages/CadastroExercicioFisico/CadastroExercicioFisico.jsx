import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { DashboardLayout } from "../../components/DashboardLayout";
import { FieldError } from "../../components/FieldError";
import { useToast } from "../../features/ui/ToastProvider";
import { dataRegistroSchema } from "../../lib/dataRegistro";
import { fieldErrorProps } from "../../lib/fieldA11y";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

const TIPOS_EXERCICIO = ["Corrida", "Musculação", "Natação", "Ciclismo", "Funcional"];

const cadastroExercicioSchema = z.object({
  tipo: z.string().min(1, "Selecione o tipo de exercício"),
  valor: z.string().min(1, "Informe o resultado"),
  data: dataRegistroSchema,
});

export default function CadastroExercicioFisico() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroExercicioSchema) });

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query (POST /api/registros-saude, tipo="desempenho_fisico").
    console.log("exercício cadastrado", dados);
    showToast("Registro salvo com sucesso");
    navigate("/usuario/cadastrar-informacoes");
  };

  return (
    <DashboardLayout title="Cadastrar Exercício Físico" navItems={navItems}>
      <Link
        to="/usuario/cadastrar-informacoes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="max-w-[420px] rounded-2xl bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="tipo">
            Tipo de exercício
          </label>
          <select
            id="tipo"
            defaultValue=""
            className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
            {...register("tipo")}
            {...fieldErrorProps(errors.tipo, "tipo")}
          >
            <option value="" disabled>
              Selecione
            </option>
            {TIPOS_EXERCICIO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <FieldError id="tipo-erro" className="mb-3">
            {errors.tipo?.message}
          </FieldError>

          <div className="mb-1 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="valor">
                Resultado
              </label>
              <input
                id="valor"
                type="text"
                placeholder="Ex: 5km em 27min"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
                {...register("valor")}
                {...fieldErrorProps(errors.valor, "valor")}
              />
              <FieldError id="valor-erro" className="mt-1">
                {errors.valor?.message}
              </FieldError>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="data">
                Data
              </label>
              <input
                id="data"
                type="text"
                placeholder="dd/mm/aaaa"
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
                {...register("data")}
                {...fieldErrorProps(errors.data, "data")}
              />
              <FieldError id="data-erro" className="mt-1">
                {errors.data?.message}
              </FieldError>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary mt-6 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Salvar registro"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
