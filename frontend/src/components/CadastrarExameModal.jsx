import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { dataRegistroSchema } from "../lib/dataRegistro";
import { fieldErrorProps } from "../lib/fieldA11y";
import { FieldError } from "./FieldError";
import { Modal } from "./Modal";

const TIPOS_EXAME = ["Glicemia em jejum", "Pressão arterial", "Hemograma completo", "IMC", "Colesterol total"];

const cadastroExameSchema = z.object({
  tipo: z.string().min(1, "Selecione o tipo de exame"),
  valor: z.string().min(1, "Informe o valor"),
  data: dataRegistroSchema,
});

export function CadastrarExameModal({ onClose, onSalvar }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroExameSchema) });

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query (POST /api/registros-saude).
    // A verificação automática (comparação com a tabela de referência clínica)
    // acontece no backend — a resposta da mutation deve trazer o status
    // (normal/atencao/alterado) já calculado, para exibir imediatamente aqui.
    onSalvar?.(dados);
    onClose();
  };

  return (
    <Modal
      tituloId="cadastrar-exame-titulo"
      onClose={onClose}
      className="w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 id="cadastrar-exame-titulo" className="text-xl font-semibold text-primary">
          Novo registro
        </h3>
        <button type="button" onClick={onClose} aria-label="Fechar" className="text-text-muted hover:text-text-dark">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="tipo">
          Tipo de exame ou índice
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
          {TIPOS_EXAME.map((tipo) => (
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
              Valor
            </label>
            <input
              id="valor"
              type="text"
              placeholder="Ex: 98 mg/dL"
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

        {/* TODO: upload de PDF/foto do exame — feature "Depois" do MVP (OCR),
            ver seção 12.1 de DOCUMENTACAO.md. Backend já suporta Pillow. */}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-line py-2.5 text-sm font-semibold text-text-dark"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Salvar registro"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
