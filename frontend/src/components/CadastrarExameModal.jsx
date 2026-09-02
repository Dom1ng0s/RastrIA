import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { dataRegistroSchema } from "../lib/dataRegistro";
import { fieldErrorProps } from "../lib/fieldA11y";
import { FieldError } from "./FieldError";
import { Modal } from "./Modal";

const TIPOS_EXAME = ["Glicemia em jejum", "Pressão arterial", "Hemograma completo", "IMC", "Colesterol total"];

// Anexo em exames (issue #99) — opcional, aceita PDF/JPG/PNG. Prototipado com
// blob URL local (URL.createObjectURL), sem persistência real: some ao
// recarregar a página, e o objeto nunca é enviado a lugar nenhum ainda.
const TIPOS_ANEXO_ACEITOS = ["application/pdf", "image/jpeg", "image/png"];
const TAMANHO_MAXIMO_ANEXO_MB = 10;

const cadastroExameSchema = z.object({
  tipo: z.string().min(1, "Selecione o tipo de exame"),
  valor: z.string().min(1, "Informe o valor"),
  data: dataRegistroSchema,
});

export function CadastrarExameModal({ onClose, onSalvar }) {
  const [anexo, setAnexo] = useState(null);
  const [erroAnexo, setErroAnexo] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroExameSchema) });

  function aoSelecionarAnexo(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) {
      setAnexo(null);
      setErroAnexo("");
      return;
    }
    if (!TIPOS_ANEXO_ACEITOS.includes(arquivo.type)) {
      setErroAnexo("Formato não aceito. Envie um PDF, JPG ou PNG.");
      evento.target.value = "";
      setAnexo(null);
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_ANEXO_MB * 1024 * 1024) {
      setErroAnexo(`Arquivo muito grande. Máximo de ${TAMANHO_MAXIMO_ANEXO_MB} MB.`);
      evento.target.value = "";
      setAnexo(null);
      return;
    }
    setErroAnexo("");
    // TODO: quando existir upload real (POST /api/registros-saude com o
    // model RegistroSaude ganhando campo de arquivo), o blob local vira o
    // arquivo enviado, e a URL exibida na lista passa a ser a URL assinada
    // devolvida pelo backend — nunca bucket público (mesmo princípio já
    // documentado para laudos da Junta Médica, ver agents/claude.md).
    setAnexo({ nome: arquivo.name, tipo: arquivo.type, url: URL.createObjectURL(arquivo) });
  }

  const onSubmit = async (dados) => {
    // TODO: substituir por mutation do TanStack Query (POST /api/registros-saude).
    // A verificação automática (comparação com a tabela de referência clínica)
    // acontece no backend — a resposta da mutation deve trazer o status
    // (normal/atencao/alterado) já calculado, para exibir imediatamente aqui.
    onSalvar?.({ ...dados, anexo });
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

        <label className="mb-1.5 mt-3 block text-xs font-medium text-text-dark" htmlFor="anexo">
          Anexo (opcional)
        </label>
        <label
          htmlFor="anexo"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3.5 py-2.5 text-sm text-text-muted hover:bg-bg-tint"
        >
          <Paperclip size={16} className="shrink-0" />
          {anexo ? anexo.nome : "Anexar PDF, JPG ou PNG do exame"}
        </label>
        <input
          id="anexo"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={aoSelecionarAnexo}
          className="sr-only"
          aria-describedby={erroAnexo ? "anexo-erro" : undefined}
        />
        <FieldError id="anexo-erro" className="mb-1 mt-1">
          {erroAnexo}
        </FieldError>

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
