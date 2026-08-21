import { useState } from "react";
import { Check, Dumbbell, FileText } from "lucide-react";
import { Link } from "react-router-dom";

import { CadastrarExameModal } from "../../components/CadastrarExameModal";
import { DashboardLayout } from "../../components/DashboardLayout";
import { navItems } from "../DashboardUsuario/DashboardUsuario";

export default function CadastroInformacoes() {
  const [modalExameAberto, setModalExameAberto] = useState(false);
  const [exameSalvo, setExameSalvo] = useState(false);

  return (
    <DashboardLayout title="Cadastrar Informações" navItems={navItems}>
      <p className="mb-6 text-sm text-text-muted">
        Escolha o que você quer registrar. Cada tipo de dado alimenta a verificação automática
        correspondente.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setModalExameAberto(true);
            setExameSalvo(false);
          }}
          className="rounded-xl border border-line bg-white p-5 text-left shadow-sm transition hover:bg-bg-tint"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full badge-normal">
            <FileText size={18} />
          </div>
          <p className="text-sm font-semibold text-primary">Cadastrar Exame</p>
          <p className="mt-1 text-xs text-text-muted">Exames laboratoriais, pressão, IMC e outros índices clínicos.</p>
          {exameSalvo && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-seafoam">
              <Check size={14} /> Registro salvo
            </p>
          )}
        </button>

        <Link
          to="/usuario/cadastrar-informacoes/exercicio"
          className="rounded-xl border border-line bg-white p-5 text-left shadow-sm transition hover:bg-bg-tint"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full badge-normal">
            <Dumbbell size={18} />
          </div>
          <p className="text-sm font-semibold text-primary">Cadastrar Exercício Físico</p>
          <p className="mt-1 text-xs text-text-muted">Corrida, musculação, natação e outros indicadores de desempenho.</p>
        </Link>
      </div>

      {modalExameAberto && (
        <CadastrarExameModal
          onClose={() => setModalExameAberto(false)}
          onSalvar={() => setExameSalvo(true)}
        />
      )}
    </DashboardLayout>
  );
}
