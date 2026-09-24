import { TERMO_CONSENTIMENTO } from "../features/consentimento/termo";

// Termo único estruturado em seções por tipo de dado. Reaproveitado tanto no
// passo de aceite (fluxo de primeiro acesso) quanto na tela de consulta
// somente-leitura (link em "Perfil") — mesmo conteúdo nos dois lugares.
//
// `nivel` é o nível do título do termo; as seções ficam um nível abaixo
// (issue #146). Nas duas telas atuais o termo fica sob o <h1> da página.
export function TermoConsentimentoLGPD({ nivel = 2, className = "" }) {
  const Titulo = `h${nivel}`;
  const TituloSecao = `h${nivel + 1}`;
  return (
    <div className={className}>
      <Titulo className="mb-2 text-sm font-semibold text-text-dark">{TERMO_CONSENTIMENTO.titulo}</Titulo>
      <p className="mb-4 text-xs leading-relaxed text-text-muted">{TERMO_CONSENTIMENTO.introducao}</p>

      {TERMO_CONSENTIMENTO.secoes.map((secao) => (
        <div key={secao.id} className="mb-4">
          <TituloSecao className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {secao.titulo}
          </TituloSecao>
          <p className="text-xs leading-relaxed text-text-muted">{secao.corpo}</p>
        </div>
      ))}

      <p className="text-xs font-medium leading-relaxed text-text-dark">
        {TERMO_CONSENTIMENTO.fechamento}
      </p>
    </div>
  );
}
