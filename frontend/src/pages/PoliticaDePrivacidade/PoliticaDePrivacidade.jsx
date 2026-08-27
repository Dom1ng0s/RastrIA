import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "../../components/Logo";
import { TERMO_CONSENTIMENTO } from "../../features/consentimento/termo";

/**
 * Página pública (sem necessidade de login) — contraparte pública do
 * TermoConsentimentoLGPD (que é mostrado só no fluxo de primeiro acesso e na
 * consulta autenticada em /perfil/termo-consentimento). Reaproveita o
 * conteúdo de TERMO_CONSENTIMENTO para as seções por tipo de dado, evitando
 * duas fontes de verdade divergentes — e complementa com os pontos que o
 * termo de consentimento não cobre (direitos do titular, base legal,
 * retenção, contato do encarregado).
 *
 * Rascunho estrutural — precisa de revisão jurídica antes de produção com
 * usuário real (ver issue original e "Segurança de Dados para Laudos
 * Médicos" em agents/claude.md).
 */
export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line px-6 py-5">
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary">
            <ArrowLeft size={16} /> Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-12">
        <div className="mb-8 rounded-lg border border-coral/40 bg-coral/10 p-4 text-xs text-text-dark">
          <strong>Rascunho estrutural.</strong> Este conteúdo ainda não passou por revisão jurídica e
          não deve ser considerado texto definitivo antes de o produto operar com usuários reais.
        </div>

        <h1 className="mb-2 text-3xl font-semibold text-primary">Política de Privacidade</h1>
        <p className="mb-8 text-sm text-text-muted">Última atualização: 27/08/2026 — versão 1.0</p>

        <div className="space-y-8 text-sm leading-relaxed text-text-dark">
          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">1. Introdução</h2>
            <p>{TERMO_CONSENTIMENTO.introducao}</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">2. Quais dados tratamos</h2>
            <div className="space-y-4">
              {TERMO_CONSENTIMENTO.secoes.map((secao) => (
                <div key={secao.id}>
                  <h3 className="mb-1 text-sm font-semibold text-text-dark">{secao.titulo}</h3>
                  <p className="text-text-muted">{secao.corpo}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">3. Base legal</h2>
            <p>
              Para dado de saúde considerado de alta sensibilidade (ex: pareceres de junta médica),
              a base legal aplicada é a tutela da saúde e/ou o cumprimento de obrigação legal ou
              regulatória da instituição (art. 11 da LGPD) — não apenas o consentimento. Para as
              demais funcionalidades, aplica-se o consentimento específico obtido no primeiro acesso,
              descrito no{" "}
              <Link to="/perfil/termo-consentimento" className="font-semibold text-primary underline">
                Termo de Consentimento
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">4. Com quem compartilhamos</h2>
            <p>
              Seus dados não são compartilhados com terceiros fora da sua instituição. Dentro dela, o
              acesso é segmentado por papel — comando/gestão vê apenas indicadores agregados, nunca
              dado clínico individual nominal.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">5. Seus direitos como titular</h2>
            <p>Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer momento:</p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Confirmação de que tratamos seus dados, e acesso a eles;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço;</li>
              <li>Informação sobre com quem seus dados são compartilhados;</li>
              <li>Revogação do consentimento, quando esta for a base legal aplicável.</li>
            </ul>
            <p className="mt-2 text-text-muted">
              Alguns dados — como pareceres formais que fundamentam decisões administrativas — podem
              ter prazo de guarda obrigatório que precede o pedido de eliminação, conforme regulamento
              aplicável à sua instituição.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">6. Retenção de dados</h2>
            <p>
              Dados são mantidos pelo tempo necessário às finalidades descritas nesta política, ou
              pelo prazo legal de guarda aplicável a cada tipo de documento — a confirmar caso a caso
              junto ao setor jurídico de cada instituição parceira, especialmente para documentos com
              implicação em decisões administrativas (ex: pareceres de junta médica).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">7. Segurança</h2>
            <p>
              Adotamos controle de acesso segmentado por papel, e medidas técnicas adicionais
              (criptografia em nível de campo, log de auditoria imutável) para os dados de maior
              sensibilidade, antes de esses dados serem tratados em produção.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">8. Encarregado de Dados (DPO)</h2>
            <p className="text-text-muted">A ser definido antes da operação com dado real de produção.</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">9. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Alterações relevantes serão comunicadas
              através da plataforma.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
