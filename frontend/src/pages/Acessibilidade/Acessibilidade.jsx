import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { ConteudoPrincipal } from "../../components/ConteudoPrincipal";
import { Logo } from "../../components/Logo";
import { RodapePublico } from "../../components/RodapePublico";
import { PREFERENCIAS } from "../../features/acessibilidade/store";
import { MINUTOS_LIMITE_SESSAO } from "../../features/auth/SessaoInativa";
import { ThemeToggle } from "../../features/theme/ThemeToggle";
import { useTituloPagina } from "../../lib/tituloPagina";

/**
 * Página de acessibilidade (issue #150). O eMAG — obrigatório para sítios do
 * governo federal e referência para órgãos estaduais, como a PMAL — pede uma
 * página descrevendo os recursos do sítio, os atalhos de teclado e o nível de
 * conformidade (Recomendação 3.11; LBI 13.146/2015, art. 63).
 *
 * Decisão do time (23/09/2026): **VLibras não será implementado** — o escopo
 * desta página é só a declaração.
 *
 * Esta página descreve o que já existe. Recurso novo de acessibilidade entra
 * aqui junto com a implementação, não depois.
 */

const ATALHOS = [
  { teclas: "Tab", acao: "Primeira tecla em qualquer tela mostra o link “Pular para o conteúdo”" },
  { teclas: "Alt + 1", acao: "Ir para o conteúdo principal" },
  { teclas: "Alt + 2", acao: "Ir para o menu de navegação" },
];

// Uma linha por preferência de Configurações › Acessibilidade. A chave é a
// mesma de `PREFERENCIAS` — o teste abaixo garante que nenhuma preferência nova
// fique de fora desta página sem alguém perceber.
const PREFERENCIAS_DESCRITAS = {
  fonteGrande: "Fonte grande — aumenta o tamanho do texto em todo o sistema.",
  modoSimplificado: "Modo simplificado — esconde elementos decorativos.",
  espacamentoTexto: "Espaçamento de texto ampliado — mais espaço entre linhas, letras, palavras e parágrafos.",
  daltonismo: "Filtro para daltonismo — troca verde/vermelho por azul/laranja nos indicadores de estado.",
  // "mais contraste", não "mais escuros" (issue #173): no tema escuro o efeito
  // é o oposto — o texto secundário clareia. A descrição vale para os dois.
  altoContraste:
    "Alto contraste — textos secundários com mais contraste contra o fundo, bordas mais fortes, links sublinhados.",
  reduzirMovimento: "Reduzir movimento — desliga animações, transições e rolagem suave.",
  alvosGrandes: "Botões e áreas de toque maiores — mínimo de 44 × 44 pixels.",
  focoReforcado: "Destaque de foco reforçado — contorno mais grosso, em amarelo e preto.",
  atalhosTeclado: "Atalhos de teclado — liga ou desliga os atalhos Alt + 1 e Alt + 2.",
  focarTituloAoNavegar: "Levar o foco ao título ao trocar de página.",
  abrirLinksMesmaAba: "Abrir anexos e links externos na mesma aba.",
  abrirTourAutomaticamente: "Abrir o tour guiado automaticamente na primeira visita a um painel.",
  duracaoAvisos: "Tempo que os avisos de sucesso ficam na tela (5, 10, 20 segundos ou até você fechar).",
};

if (import.meta.env.DEV) {
  const faltando = Object.keys(PREFERENCIAS).filter((chave) => !(chave in PREFERENCIAS_DESCRITAS));
  if (faltando.length > 0) {
    console.warn(
      `Preferência de acessibilidade sem descrição na página /acessibilidade: ${faltando.join(", ")}. ` +
        "Toda preferência de Configurações › Acessibilidade precisa aparecer lá (issue #150).",
    );
  }
}

const TECNOLOGIAS_TESTADAS = [
  "NVDA com Firefox e Chrome (Windows)",
  "VoiceOver no iOS e no macOS",
  "TalkBack no Android",
  "Navegação só por teclado, sem mouse",
  "Zoom do navegador até 200% e texto redimensionado",
];

function Secao({ id, titulo, children }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-2 text-base font-semibold text-primary">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export default function Acessibilidade() {
  useTituloPagina("Acessibilidade");

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line px-6 py-5">
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <Link to="/" aria-label="Rastria — página inicial">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/" className="flex min-h-[24px] items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary">
              <ArrowLeft aria-hidden="true" size={16} /> Voltar
            </Link>
          </div>
        </div>
      </header>

      <ConteudoPrincipal className="mx-auto max-w-[720px] px-6 py-12">
        <h1 className="mb-2 text-3xl font-semibold text-primary">Acessibilidade</h1>
        <p className="mb-8 text-sm text-text-muted">Última avaliação: 03/10/2026</p>

        <div className="texto-corrido space-y-8 text-sm leading-relaxed text-text-dark">
          <Secao id="compromisso" titulo="Nosso compromisso">
            <p>
              A Rastria é usada por instituições públicas, e acompanhar a própria saúde não pode
              depender de enxergar bem, ouvir, usar um mouse ou ter o dia bom. Trabalhamos para que
              toda tela atenda ao <strong>WCAG 2.2 nível AA</strong> e ao <strong>eMAG 3.1</strong>, o
              Modelo de Acessibilidade em Governo Eletrônico, conforme o art. 63 da Lei Brasileira de
              Inclusão (Lei nº 13.146/2015).
            </p>
          </Secao>

          <Secao id="recursos" titulo="Recursos disponíveis em todas as telas">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>Link “Pular para o conteúdo” como primeiro item de cada tela.</li>
              <li>Estrutura de títulos e marcos de página (menu, conteúdo, rodapé) para leitores de tela.</li>
              <li>Tema escuro, que acompanha a preferência do seu sistema.</li>
              <li>Formulários com rótulo visível, formato esperado e erro descrito em texto.</li>
              <li>Nenhuma informação transmitida só por cor: estados e posições também vêm em texto.</li>
              <li>Mudança de tela anunciada para quem usa leitor de tela.</li>
            </ul>
          </Secao>

          <Secao id="atalhos" titulo="Atalhos de teclado">
            <dl className="divide-y divide-line rounded-lg border border-line">
              {ATALHOS.map((atalho) => (
                <div key={atalho.teclas} className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="min-w-0 flex-1">{atalho.acao}</dt>
                  <dd>
                    <kbd className="rounded border border-line bg-bg-tint px-2 py-0.5 font-body text-xs font-semibold text-text-dark">
                      {atalho.teclas}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-text-muted">
              Os atalhos seguem o padrão do eMAG e podem ser desligados, caso conflitem com o seu
              leitor de tela ou navegador.
            </p>
          </Secao>

          <Secao id="preferencias" titulo="Preferências que você pode ajustar">
            <p className="mb-3">
              Depois de entrar, em <strong>Configurações › Acessibilidade</strong> você escolhe:
            </p>
            <ul className="ml-5 list-disc space-y-1.5">
              {Object.keys(PREFERENCIAS)
                .filter((chave) => chave in PREFERENCIAS_DESCRITAS)
                .map((chave) => (
                  <li key={chave}>{PREFERENCIAS_DESCRITAS[chave]}</li>
                ))}
            </ul>
            <p className="mt-3 text-xs text-text-muted">
              Alto contraste e redução de movimento já começam ligados se o seu sistema operacional
              estiver configurado assim. Suas escolhas ficam guardadas no navegador.
            </p>
          </Secao>

          <Secao id="sessao" titulo="Tempo de sessão">
            <p>
              Por segurança, a sessão é encerrada depois de <strong>{MINUTOS_LIMITE_SESSAO} minutos</strong>{" "}
              sem atividade. Dois minutos antes aparece um aviso para você renová-la, sem perder o que
              estava fazendo.
            </p>
          </Secao>

          <Secao id="testes" titulo="Tecnologias assistivas testadas">
            <ul className="ml-5 list-disc space-y-1.5">
              {TECNOLOGIAS_TESTADAS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Secao>

          <Secao id="limitacoes" titulo="Limitações conhecidas">
            <p>
              A plataforma está em desenvolvimento e ainda não concluímos a auditoria completa de
              conformidade. As barreiras já identificadas estão registradas publicamente, com a
              etiqueta <code className="rounded bg-bg-tint px-1">accessibility</code>, em{" "}
              <a
                href="https://github.com/Dom1ng0s/RastrIA/issues?q=is%3Aissue+is%3Aopen+label%3Aaccessibility"
                className="font-medium text-primary underline"
              >
                nosso repositório de issues
              </a>
              . Também não oferecemos tradução automática para Libras.
            </p>
          </Secao>

          <Secao id="contato" titulo="Encontrou uma barreira?">
            <p>
              Conte para a gente — relato de barreira entra na fila como qualquer outro problema, e é
              assim que esta página melhora. Dentro da plataforma, use{" "}
              <strong>Reportar problema</strong> no menu lateral. Por e-mail:{" "}
              <a href="mailto:domingoslabs@gmail.com" className="font-medium text-primary underline">
                domingoslabs@gmail.com
              </a>
              .
            </p>
          </Secao>
        </div>
      </ConteudoPrincipal>

      <RodapePublico atual="/acessibilidade" />
    </div>
  );
}
