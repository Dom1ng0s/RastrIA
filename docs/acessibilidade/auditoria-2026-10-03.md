# Auditoria de acessibilidade — fechamento (03/10/2026)

Fecha a auditoria aberta em 23/09/2026 (issue #152). A varredura original
cobriu `frontend/src` inteiro e as 30 rotas, por leitura de código e medição de
contraste da paleta; este documento registra o estado **depois** das 18 issues
que ela gerou, e o que passou a ser verificado por máquina.

Meta: **WCAG 2.2 nível AA** + **eMAG 3.1**. Referências na issue #152.

## Checklist dos 15 itens essenciais — estado final

| # | Item | WCAG | Situação | Onde foi resolvido |
|---|---|---|---|---|
| 1 | Idioma da página | 3.1.1 | ✅ | `lang="pt-BR"` em `index.html` |
| 2 | Título de página descritivo | 2.4.2 | ✅ | `lib/tituloPagina.js` + `AnuncioDeRota` (#135) |
| 3 | Pular blocos e landmarks | 2.4.1, 1.3.1 | ✅ | `PularParaConteudo`, `ConteudoPrincipal`, `AtalhosTeclado` (#134) |
| 4 | Hierarquia de títulos | 1.3.1, 2.4.6 | ✅ ¹ | um `<h1>` por tela, `<h2>` por bloco (#146) |
| 5 | Alternativa textual de imagens/ícones | 1.1.1 | ✅ | `aria-hidden` em todo ícone, logo nomeado, aviso de nova aba (#148) |
| 6 | Contraste de texto e componentes | 1.4.3, 1.4.11 | ✅ | paleta corrigida (#137); verificado por axe nas 11 rotas |
| 7 | Não depender só de cor | 1.4.1 | ✅ | pódio, "Você", senha, filtros + filtro para daltonismo (#138) |
| 8 | Operável por teclado, sem armadilha | 2.1.1, 2.1.2 | ✅ ² | menus Disclosure (#139), gavetas como diálogo (#140) |
| 9 | Foco visível | 2.4.7, 2.4.11 | ✅ | `:focus-visible` no design system + foco reforçado (#136) |
| 10 | Rótulo de campo, nome de link/botão | 1.3.1, 3.3.2, 4.1.2, 2.4.4 | ✅ | #141, #148 |
| 11 | Instruções, obrigatoriedade e erros | 3.3.1, 3.3.2, 1.3.5 | ✅ | `CampoObrigatorio`, `fieldA11y`, autocomplete (#42, #147) |
| 12 | Mensagens de status anunciadas | 4.1.3 | ✅ ² | `ToastProvider` com região live persistente (#142); força de senha (#138) |
| 13 | Limite de tempo ajustável | 2.2.1 | ✅ | 30 min + aviso para renovar (#143) |
| 14 | Movimento controlável | 2.2.2, 2.3.3 | ✅ | `prefers-reduced-motion` + preferência própria (#145) |
| 15 | Zoom, texto e alvos de toque | 1.4.4, 1.4.10, 1.4.12, 2.5.8 | ✅ | alvos 44px (#144), reflow em 320px (#161), espaçamento de texto (#149) |

¹ Com uma ressalva, abaixo. ² Verificado por axe e por teste de interação; a
confirmação com leitor de tela real é a seção 2 do roteiro manual.

## O que passou a ser verificado por máquina (#123, #151)

| Verificação | Comando | Cobertura |
|---|---|---|
| Lint `jsx-a11y` no JSX | `npm run lint` | todo `src/` |
| axe por componente + aba Acessibilidade | `npm test` | 7 componentes, 109 testes no total |
| axe por página | `npm run test:a11y` | 11 rotas × claro/escuro × preferências ligadas, cada preferência isolada, tour aberto, reflow em 320px — 43 testes, zero violações |

A segregação de acesso por papel (`RotaProtegida`) também ficou coberta: todos
os pares papel × rota de outro papel.

## Segunda passada — revisão visual (03/10/2026, mesmo dia)

Logo depois do fechamento acima, uma varredura visual e de layout (34 rotas ×
7 combinações de tema e preferências, medindo overflow, truncamento, contraste
recalculado e tamanho de alvo) encontrou **seis** pontos que a verificação
automática de acessibilidade não acusava. Todos corrigidos e fechados:

| Issue | Achado | Por que o axe não pegava |
|---|---|---|
| #168 | "Não lida" da notificação só por cor, fundo e peso | estado visual sem equivalente programático não é violação de regra isolada |
| #170 | Badges sem variante de tema escuro — aviso de pendências virava faixa quase branca | o contraste do texto passava em AA; o problema era de tema |
| #169 | Quatro alvos de toque em 18–20px | a 2.5.8 não está no conjunto de regras que o axe roda por padrão |
| #172 | Nome clicável sem aparência de link | descoberta, não conformidade |
| #171 | "Espaçamento de texto" abrindo faixas vazias nos cards | nenhum conteúdo era perdido |
| #173 | Descrição do alto contraste errada no tema escuro | é texto, não marcação |

A varredura também confirmou o que está sadio: **zero** overflow horizontal em
qualquer rota (inclusive 320px e com espaçamento ampliado), **zero** falha de
contraste com o contraste recalculado nó a nó nas sete combinações, erros de
formulário com `role="alert"` + `aria-invalid` + foco no primeiro campo
inválido, foco visível sobre a sidebar escura, e nenhum `label-in-name`
quebrado.

A lição que fica registrada: **a cobertura automática não substitui olhar a
tela.** Quatro dos seis achados são invisíveis para qualquer ferramenta.

O teste de página ganhou asserção de tamanho de alvo (WCAG 2.5.8) em 9 rotas,
para esse grupo específico não voltar.

## Limitações conhecidas

1. **Segundo `<h1>` no tour guiado.** O `react-joyride` renderiza o título do
   passo como `<h1>` dentro do próprio diálogo. O axe não trata como violação
   e o diálogo é um contexto à parte, mas foge da regra de um `<h1>` por tela.
   Resolver exige `tooltipComponent` próprio — vale abrir issue se o tour
   crescer.
2. **Lint e testes não rodam no CI**, porque não existe workflow neste
   repositório. É a issue **#68**. Até lá, os três comandos são
   responsabilidade de quem abre o PR.
3. **Nada foi validado com leitor de tela real ainda.** Toda a verificação é
   automática ou por árvore de acessibilidade. A seção 2 do roteiro manual
   (NVDA + Firefox, VoiceOver) precisa de uma rodada antes do piloto — é o que
   pega o que ferramenta nenhuma pega: se a tela faz sentido ouvida.
4. **Libras não é oferecido** (decisão do time, 23/09/2026). Declarado na
   página pública `/acessibilidade`.

## Manutenção

- Recurso novo de acessibilidade entra junto com a descrição dele na página
  pública `/acessibilidade` — a página tem aviso em desenvolvimento quando uma
  preferência nova fica sem descrição.
- Preferência nova em `features/acessibilidade/preferencias.js` entra sozinha na
  varredura axe e no teste da aba.
- Próxima rodada do roteiro manual: antes da entrega do piloto PMAL. Atualizar
  a data de "Última avaliação" na página `/acessibilidade` a cada rodada.
