import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { TermoConsentimentoLGPD } from "../../components/TermoConsentimentoLGPD";
import { useConsentimentoStore } from "../../features/consentimento/store";

// Consulta somente-leitura do termo aceito no primeiro acesso — não é
// revogável pelo usuário, mas precisa ficar sempre disponível (ver issue
// "Tela de consentimento LGPD no primeiro acesso"). Acessada pelo link em
// "Perfil".
export default function TermoConsentimento() {
  const consentimento = useConsentimentoStore((state) => state.consentimento);

  return (
    <div className="mx-auto min-h-screen max-w-[640px] p-8">
      <Link to="/perfil" className="mb-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ArrowLeft size={16} />
        Voltar para o Perfil
      </Link>

      <div className="rounded-2xl border border-line bg-white p-7">
        {consentimento ? (
          <p className="mb-6 rounded-lg bg-bg-tint px-4 py-3 text-xs text-text-muted">
            Aceito em{" "}
            <span className="font-medium text-text-dark">
              {format(new Date(consentimento.aceitoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>{" "}
            (versão {consentimento.versao} do termo). Este aceite não pode ser revogado.
          </p>
        ) : (
          <p className="mb-6 rounded-lg bg-bg-tint px-4 py-3 text-xs text-text-muted">
            Nenhum registro de aceite encontrado nesta conta.
          </p>
        )}

        <TermoConsentimentoLGPD />
      </div>
    </div>
  );
}
