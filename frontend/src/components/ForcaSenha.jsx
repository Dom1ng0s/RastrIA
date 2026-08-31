import { Check, X } from "lucide-react";

import { avaliarSenha } from "../lib/senha";

// Indicador de força de senha em tempo real (issue #96) — barra + checklist dos
// requisitos ficando verdes conforme o usuário digita. Usado em toda tela de
// criação/troca de senha (PrimeiroAcesso, RedefinirSenha, AlterarSenha) no
// lugar da dica estática. A validação de envio continua no `senhaForteSchema`.

const NIVEIS = [
  { label: "muito fraca", cor: "bg-coral" },
  { label: "fraca", cor: "bg-coral" },
  { label: "média", cor: "bg-amber-400" },
  { label: "quase lá", cor: "bg-amber-400" },
  { label: "forte", cor: "bg-seafoam" },
];

export function ForcaSenha({ senha = "", id }) {
  const { criterios, cumpridos, total } = avaliarSenha(senha);
  const nivel = NIVEIS[cumpridos];
  const largura = senha ? Math.max((cumpridos / total) * 100, 8) : 0;

  return (
    <div id={id} className="mb-4 mt-1.5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div
            className={`h-full rounded-full transition-all duration-200 ${nivel.cor}`}
            style={{ width: `${largura}%` }}
          />
        </div>
        <span className="w-16 shrink-0 text-right text-xs font-medium text-text-muted">
          {senha ? nivel.label : ""}
        </span>
      </div>

      <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {criterios.map((criterio) => (
          <li
            key={criterio.id}
            className={`flex items-center gap-1.5 text-xs ${
              criterio.ok ? "text-seafoam" : "text-text-muted"
            }`}
          >
            {criterio.ok ? (
              <Check size={13} className="shrink-0" />
            ) : (
              <X size={13} className="shrink-0 opacity-40" />
            )}
            {criterio.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
