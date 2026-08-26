import { TERMO_CONSENTIMENTO } from "../features/consentimento/termo";

// Termo único estruturado em seções por tipo de dado. Reaproveitado tanto no
// passo de aceite (fluxo de primeiro acesso) quanto na tela de consulta
// somente-leitura (link em "Perfil") — mesmo conteúdo nos dois lugares.
export function TermoConsentimentoLGPD({ className = "" }) {
  return (
    <div className={className}>
      <h3 className="mb-2 text-sm font-semibold text-text-dark">{TERMO_CONSENTIMENTO.titulo}</h3>
      <p className="mb-4 text-xs leading-relaxed text-text-muted">{TERMO_CONSENTIMENTO.introducao}</p>

      {TERMO_CONSENTIMENTO.secoes.map((secao) => (
        <div key={secao.id} className="mb-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {secao.titulo}
          </h4>
          <p className="text-xs leading-relaxed text-text-muted">{secao.corpo}</p>
        </div>
      ))}

      <p className="text-xs font-medium leading-relaxed text-text-dark">
        {TERMO_CONSENTIMENTO.fechamento}
      </p>
    </div>
  );
}
