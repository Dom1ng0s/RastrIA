import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "../../components/Logo";

/**
 * Página pública (sem necessidade de login) — ver issue "páginas de Termos de
 * Uso e Política de Privacidade". Conteúdo abaixo é rascunho estrutural,
 * cobrindo os pontos que já discutimos ao longo do projeto (provisionamento
 * institucional, natureza informativa da verificação automática) — não é
 * texto jurídico definitivo. Precisa de revisão por advogado antes de
 * produção com usuário real, conforme já registrado na issue original.
 */
export default function TermosDeUso() {
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

        <h1 className="mb-2 text-3xl font-semibold text-primary">Termos de Uso</h1>
        <p className="mb-8 text-sm text-text-muted">Última atualização: 27/08/2026 — versão 1.0</p>

        <div className="space-y-8 text-sm leading-relaxed text-text-dark">
          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">1. Aceite dos termos</h2>
            <p>
              Ao acessar ou usar a Rastria, você concorda com estes Termos de Uso. Caso não concorde,
              não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">2. Natureza institucional do serviço</h2>
            <p>
              A Rastria é uma plataforma de uso institucional. Não existe cadastro público — contas são
              provisionadas exclusivamente pela instituição à qual você está vinculado (empresa,
              corporação ou entidade parceira), a partir de dados fornecidos por ela. Ao receber uma
              conta, você declara estar de fato vinculado a essa instituição.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">3. Responsabilidades do usuário</h2>
            <p>Você se compromete a:</p>
            <ul className="ml-5 mt-2 list-disc space-y-1">
              <li>Manter em sigilo sua senha e não compartilhá-la com terceiros;</li>
              <li>Cadastrar informações de saúde e desempenho físico de forma verdadeira e precisa;</li>
              <li>Utilizar a plataforma apenas para os fins a que se destina.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">4. Natureza informativa da verificação automática</h2>
            <p>
              A verificação automática de índices contra tabelas de referência clínica tem caráter
              exclusivamente informativo. Ela não constitui diagnóstico médico, não substitui avaliação
              por profissional de saúde qualificado, e não deve ser usada como única base para decisões
              sobre sua saúde. Sempre consulte um profissional habilitado.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">5. Encerramento de acesso</h2>
            <p>
              Seu acesso pode ser encerrado pela instituição a qualquer momento, inclusive em caso de
              desligamento dela. O histórico de dados de saúde permanece sujeito às regras descritas na{" "}
              <Link to="/politica-de-privacidade" className="font-semibold text-primary underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">6. Alterações nestes termos</h2>
            <p>
              Podemos atualizar estes Termos de Uso periodicamente. Alterações relevantes serão
              comunicadas através da plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-primary">7. Legislação aplicável</h2>
            <p>Estes termos são regidos pelas leis da República Federativa do Brasil.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
