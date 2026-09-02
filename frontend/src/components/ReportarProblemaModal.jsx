import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { fieldErrorProps } from "../lib/fieldA11y";
import { FieldError } from "./FieldError";
import { Modal } from "./Modal";

const reportarProblemaSchema = z.object({
  tela: z.string().min(1, "Informe em qual tela aconteceu"),
  descricao: z.string().trim().min(10, "Descreva com um pouco mais de detalhe (mínimo 10 caracteres)"),
});

/**
 * "Reportar problema" (issue #93) — acessível pelo menu principal (sidebar),
 * disponível em qualquer tela logada. Envio real (persistência do report)
 * depende de endpoint de backend ainda não existente — por enquanto é
 * mockado com confirmação via toast, como o resto dos formulários do app
 * nesta fase.
 */
export function ReportarProblemaModal({ telaAtual, onClose, onEnviado }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reportarProblemaSchema),
    defaultValues: { tela: telaAtual ?? "", descricao: "" },
  });

  const onSubmit = async () => {
    // TODO: substituir por mutation do TanStack Query (POST /api/reportes-problema)
    // quando o endpoint existir. Enviar também metadados úteis para triagem
    // (papel do usuário, navegador/versão) que não fazem sentido pedir à mão
    // no formulário.
    onEnviado?.();
    onClose();
  };

  return (
    <Modal
      tituloId="reportar-problema-titulo"
      onClose={onClose}
      className="w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 id="reportar-problema-titulo" className="text-xl font-semibold text-primary">
          Reportar problema
        </h3>
        <button type="button" onClick={onClose} aria-label="Fechar" className="text-text-muted hover:text-text-dark">
          <X size={20} />
        </button>
      </div>

      <p className="mb-5 text-sm text-text-muted">
        Encontrou algo que não funcionou como esperado? Conte pra gente — isso não substitui
        acompanhamento médico nem solicitação de atendimento.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="tela">
          Em qual tela aconteceu?
        </label>
        <input
          id="tela"
          type="text"
          placeholder="Ex: Meu Histórico, Solicitar Acompanhamento..."
          className="mb-1 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
          {...register("tela")}
          {...fieldErrorProps(errors.tela, "tela")}
        />
        <FieldError id="tela-erro" className="mb-3">
          {errors.tela?.message}
        </FieldError>

        <label className="mb-1.5 block text-xs font-medium text-text-dark" htmlFor="descricao">
          O que aconteceu?
        </label>
        <textarea
          id="descricao"
          rows={4}
          placeholder="Descreva o que você esperava que acontecesse e o que aconteceu de fato."
          className="mb-1 w-full resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-text-dark"
          {...register("descricao")}
          {...fieldErrorProps(errors.descricao, "descricao")}
        />
        <FieldError id="descricao-erro" className="mb-3">
          {errors.descricao?.message}
        </FieldError>

        {/* Print/anexo fica para quando o endpoint de upload existir (mesma
            dependência da issue #99, anexo em exames) — sem isso, um arquivo
            "enviado" aqui não iria a lugar nenhum. */}

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
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
