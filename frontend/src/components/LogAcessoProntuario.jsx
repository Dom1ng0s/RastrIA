import { Eye } from "lucide-react";

import { EmptyState } from "./EmptyState";

/**
 * "Quem viu meu dado" (issue #89) — torna verificável pelo próprio dono do
 * dado a garantia central do produto de que a hierarquia (gerente/comando)
 * nunca vê dado clínico individual, só quem tem autorização (médico/educador
 * físico responsável). Dado mockado por enquanto — funcionalidade real
 * depende de um log de auditoria no backend (registrar toda leitura de
 * prontuário de terceiros), que ainda não existe.
 *
 * TODO: substituir por dado real via TanStack Query (GET /api/usuarios/me/acessos)
 * quando o endpoint existir.
 */
const acessosMock = [
  { id: 1, profissional: "Dra. Camila Andrade", papel: "Médica", data: "15 ago 2026", hora: "14:32" },
  { id: 2, profissional: "Educador Rafael Souza", papel: "Educador físico", data: "12 ago 2026", hora: "09:10" },
  { id: 3, profissional: "Dra. Camila Andrade", papel: "Médica", data: "05 ago 2026", hora: "11:47" },
];

export function LogAcessoProntuario() {
  return (
    <div className="max-w-[520px] rounded-2xl border border-line bg-white p-7">
      <h2 className="mb-1 text-sm font-semibold text-text-dark">Quem acessou seu prontuário</h2>
      <p className="mb-4 text-xs text-text-muted">
        Só profissionais autorizados da sua instituição (médico ou educador físico responsável)
        podem ver seu histórico individual — o comando/gerência nunca tem esse acesso, só um painel
        agregado. Esta lista mostra cada vez que alguém abriu seus dados.
      </p>

      {acessosMock.length === 0 ? (
        <EmptyState icon={Eye} title="Ninguém acessou seu prontuário ainda" />
      ) : (
        <ul className="space-y-2">
          {acessosMock.map((acesso) => (
            <li
              key={acesso.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-line px-4 py-2.5 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-dark">{acesso.profissional}</p>
                <p className="truncate text-xs text-text-muted">{acesso.papel}</p>
              </div>
              <span className="shrink-0 text-xs text-text-muted">
                {acesso.data} · {acesso.hora}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
