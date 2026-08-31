import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

// Acordeão acessível de perguntas frequentes (issue #91). Cada item é um
// <button> que controla a visibilidade da resposta via aria-expanded /
// aria-controls; a resposta usa [hidden] em vez de display:none inline.
export function FaqAccordion({ itens }) {
  const [aberto, setAberto] = useState(null);
  const baseId = useId();

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white">
      {itens.map((item, indice) => {
        const estaAberto = aberto === indice;
        const botaoId = `${baseId}-botao-${indice}`;
        const painelId = `${baseId}-painel-${indice}`;

        return (
          <div key={item.pergunta}>
            <h3 className="m-0">
              <button
                type="button"
                id={botaoId}
                aria-expanded={estaAberto}
                aria-controls={painelId}
                onClick={() => setAberto(estaAberto ? null : indice)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text-dark hover:bg-bg-tint"
              >
                {item.pergunta}
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={`shrink-0 text-text-muted transition-transform ${estaAberto ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div id={painelId} role="region" aria-labelledby={botaoId} hidden={!estaAberto}>
              <p className="px-5 pb-4 text-sm leading-relaxed text-text-muted">{item.resposta}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
