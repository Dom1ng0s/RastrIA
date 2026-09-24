# Rastria — Guia do Projeto

## Visão Geral
Rastria é uma plataforma digital que centraliza o histórico de saúde e desempenho físico do usuário, verifica automaticamente os índices cadastrados contra tabelas de referência clínica, e conecta o usuário a médicos e educadores físicos **da própria instituição**. Opera **exclusivamente como plataforma institucional (B2B/B2G)** para empresas, academias e corporações que precisam acompanhar a saúde ocupacional de seus integrantes — piloto em andamento: **Polícia Militar de Alagoas**. Não há cadastro público de pessoa física: contas são provisionadas pela própria instituição (ver "Decisão de Arquitetura: Fim do Autocadastro" abaixo).

- MVP em produção: rastria.up.railway.app
- Repositório: github.com/Dom1ng0s/RastrIA

**Problema:** o acompanhamento de saúde no Brasil é fragmentado entre clínicas, laboratórios e academias, sem histórico centralizado. Em paralelo, empresas e forças policiais são legalmente obrigadas a acompanhar a saúde ocupacional de seus integrantes (NR-7/PCMSO), mas hoje o fazem de forma manual.

**Solução, em três pilares:** Cadastro (exames, avaliações, desempenho físico) → Verificação automática (índices comparados a tabelas de referência clínica) → Conexão (solicitação de acompanhamento a profissionais da própria instituição).

## Estado Atual do Repositório
O backend (`backend/`, Django+DRF) e o frontend (`frontend/`, React+Vite) já estão scaffolded — ver "Estrutura do Repositório" abaixo. O serviço Railway na raiz builda e serve o `frontend/` (ver "Deploy"). O backend **ainda não está deployado** como serviço — hoje só roda localmente; colocá-lo no ar exige configurar um segundo serviço no dashboard do Railway apontando para `backend/`, o que ainda não foi feito.

**Login ainda não é autenticação real.** `pages/Login/Login.jsx` traz um atalho que escolhe o papel (`features/auth/roles.js`) e navega para a tela inicial correspondente (`/gerente`, `/medico`, `/educador-fisico`, `/usuario`) — não há chamada de API, token JWT ou verificação de credencial. Isso é intencional para permitir revisar as telas sem o backend de auth pronto; ao implementar login real, precisa ser substituído por uma mutation do TanStack Query contra `POST /api/auth/token/`, com o papel vindo do usuário autenticado (não de uma escolha manual).

Desde 18/09/2026 (issue #128) esse atalho — e a reidratação do papel a partir do `localStorage`, que é o mecanismo por trás dele — só existe com `VITE_MODO_DEMO` ligada (`features/demo/flag.js`), o que mantém o build de piloto/produção sem essa porta aberta. **A flag reduz a exposição, não substitui a remoção:** o bloco deve sair de vez quando o login estiver integrado à API.

**Existe uma camada de dados, e ela é o caminho único para a API.** Toda tela consome `features/<área>/queries.js` (`instituicoes`, `integrantes`, `ranking`, `saude`, `atendimentos`), cujos hooks hoje resolvem mocks através de `lib/mockQuery.js` mas já entregam o formato real do TanStack Query (`data`/`isLoading`/`isError`/`refetch`). Nenhuma tela guarda mock inline. Ao ligar o backend, muda-se a `queryFn` dentro do `queries.js` — a tela não muda. Mocks novos entram por ali, nunca de volta para dentro de uma tela.

**Não existe mais autocadastro** (decisão de 23/08/2026 — ver seção dedicada abaixo). O fluxo atual é `/onboarding` (peso, altura, idade, roda no primeiro login) → `/usuario`. A tela `Cadastro.jsx`, a tela `AutorizacaoUsuario.jsx` e as rotas `/cadastro` e `/gerente/autorizacao` foram removidas do frontend. Contas nascem provisionadas administrativamente pela instituição (import em lote, via Django admin — ainda não implementado no backend), já com papel definido, não mais aguardando atribuição posterior por um gerente.

## Stack Técnica (alvo)
| Camada | Escolha | Por quê |
|---|---|---|
| Backend | Django + Django REST Framework | Equipe já tem experiência (PIBIC); admin nativo; sistema de permissões do Django mapeia bem os papéis do domínio |
| Banco de dados | PostgreSQL | Transacional; suporta JSON para variações de tipos de exame |
| Frontend | React (Vite) + Tailwind | Familiaridade da equipe; tokens de cor do manual de marca aplicados via config do Tailwind |
| Autenticação | JWT (`djangorestframework-simplejwt`) | Simples, funciona bem com SPA |
| Deploy | Railway (Nixpacks) | Já em uso; suporta múltiplos serviços no mesmo projeto |

**Bibliotecas frontend (uso primário — preferir estas antes de introduzir alternativas):**
- **TanStack Query** — cache/estado de dados do servidor; toda chamada à API que popula UI deve passar por um hook de query/mutation, não `useEffect` + `fetch` manual.
- **Axios** — cliente HTTP, centralizado em `src/lib/api.js`.
- **React Router** — roteamento client-side.
- **Zustand** — estado global de cliente (ex: sessão, UI), separado do estado de servidor (que é do TanStack Query — não duplicar dado de API em store do Zustand).
- **React Hook Form + Zod** — formulários e validação; schema Zod como fonte única de verdade da validação, reaproveitado entre form e (idealmente) tipagem.
- **date-fns** — manipulação de datas.
- **Lucide React** — ícones.

## Padrão de Arquitetura
Pensar sempre como uma aplicação **Model-View-Controller**:
- **Model** — apps/modelos Django mapeando o domínio (ver seção "Modelo de Dados" abaixo).
- **Controller** — viewsets/serializers do DRF expondo a API, com permissões por papel.
- **View** — o frontend React consome a API como camada de apresentação; não deve conter regra de negócio de autorização (isso vive no backend).

## Estrutura do Repositório (planejada)
Monorepo, backend e frontend em pastas separadas (mais simples de gerenciar por um time de 4 pessoas do que repos separados; Railway aponta cada serviço para uma subpasta diferente do mesmo repo; um PR só já mostra a mudança de backend+frontend juntas quando uma feature toca os dois lados):

```
RastrIA/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── railway.json
│   ├── rastria/                 # configuração do projeto Django
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── dev.py
│   │   │   └── prod.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── core/                # models base, mixins, permissões compartilhadas
│   │   ├── usuarios/             # User customizado + papéis (gerente/médico/integrante)
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── permissions.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── instituicoes/         # Instituição (com instituicao_pai — hierarquia multinível), vínculo usuário-instituição, papel
│   │   ├── saude/                # RegistroSaude, regras de verificação automática
│   │   ├── profissionais/        # Médico, Educador Físico, registro CRM/CREF
│   │   └── atendimentos/         # Solicitação, Atendimento, VinculoCuidado (continuidade usuário-profissional), histórico
│   └── tests/
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js       # tokens de cor do manual de marca (Primary/Seafoam/Coral)
│   ├── package.json
│   ├── railway.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── routes/               # React Router
│       ├── pages/
│       │   ├── Landing/
│       │   ├── Login/
│       │   ├── Onboarding/                # peso/altura/idade, no primeiro login (sem autocadastro — ver decisão dedicada)
│       │   ├── DashboardGerente/          # Resp. Comando
│       │   ├── DashboardMedico/           # Resp. Médico
│       │   ├── DashboardEducadorFisico/   # Resp. Educador Físico
│       │   └── DashboardUsuario/          # Usuário individual
│       ├── features/             # feature-sliced: hooks de TanStack Query, stores Zustand, forms
│       │   ├── auth/
│       │   ├── saude/
│       │   ├── atendimentos/
│       │   └── ui/                        # ToastProvider (feedback visual global, ver Sistema de Componentes)
│       ├── components/           # componentes reutilizáveis (Button, Card, etc.)
│       ├── lib/
│       │   └── api.js            # cliente HTTP (Axios) para o backend
│       ├── styles/
│       └── assets/
│           └── logo/             # logo_cropped.png, logo_reversed.png
│
├── docs/                         # só material já pensado para ser público
│   ├── brand/                    # manual de marca, logos
│   ├── pitch/                    # pitch deck (pdf/pptx)
│   └── diagrams/                 # diagramas UML (svg)
│
├── .github/
│   └── workflows/                # CI (lint, testes) — opcional, adicionar quando der tempo
│
├── .gitignore
└── README.md
```

O `index.html` estático que existia na raiz foi removido — o serviço Railway da raiz agora builda e serve `frontend/` (ver "Deploy"). Quando o backend for deployado, o próximo passo é configurar um serviço Railway separado apontando para `backend/` (dashboard, fora do alcance de um agente).

## O que Fica de Fora do Repositório
Documentos de negociação institucional (ex: propostas endereçadas a um contato específico, com nome de pessoa física e estratégia de abordagem institucional) **não devem ser commitados neste repositório, nem em `docs/`**. O repositório é público no GitHub, e qualquer arquivo commitado permanece no histórico do Git mesmo que seja apagado depois. Esse tipo de material deve ficar num Drive/Notion privado do time — `docs/` é reservado a conteúdo já pensado para ser público (manual de marca, pitch deck, diagramas). Se for pedido para adicionar algo do tipo ao repo, sinalizar essa regra antes de commitar.

## Estratégia de Branches
Fluxo simplificado — sem `release/*` nem `hotfix/*` separados (excesso de processo para um time pequeno em fase de MVP):

```
main                              → sempre igual ao que está em produção (rastria.up.railway.app)
└── develop                       → branch de integração, onde as features se juntam
      ├── feature/auth-login-jwt
      ├── feature/cadastro-exames
      ├── feature/dashboard-gerente
      ├── feature/verificacao-automatica
      └── fix/bug-upload-pdf
```

| Branch | Propósito | Quem pode commitar direto |
|---|---|---|
| `main` | Produção. Só recebe merge de `develop` via PR aprovado. | Ninguém — só via PR |
| `develop` | Integração das features. Deploy automático em ambiente de staging. | Ninguém — só via PR |
| `feature/*` | Uma funcionalidade por branch. Nasce de `develop`, morre nela. | Quem está fazendo a feature |
| `fix/*` | Correção de bug. Mesma lógica de `feature/*`. | Quem está corrigindo |

**Convenção de nomes:** `feature/<área>-<descrição-curta>` e `fix/<área>-<descrição-curta>`, minúsculas com hífen. Ex.: `feature/usuarios-cadastro-papel`, `feature/saude-verificacao-regras`, `fix/atendimentos-data-invalida`.

**Fluxo de trabalho:**
1. Criar branch a partir de `develop` atualizada.
2. Commitar com [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`).
3. Abrir Pull Request para `develop`, com pelo menos 1 aprovação de outro integrante antes do merge.
4. Squash merge (histórico de `develop` limpo, uma linha por feature).
5. Periodicamente, merge de `develop` → `main` com tag de versão (`v0.1.0`, `v0.2.0`…).

Proteções no GitHub (Settings → Branches): PR obrigatório em `main` e `develop`; `main` exige 1+ review aprovado; force-push bloqueado em ambas.

## Domínio — Papéis e Acesso
A segmentação de acesso por papel é o núcleo do produto, não um detalhe de UI:

| Papel | O que enxerga | Descrição |
|---|---|---|
| Usuário individual | Próprio histórico | Cadastra dados, visualiza verificação automática, solicita acompanhamento |
| Médico | Dados dos pacientes que atende, dentro da própria instituição | Vinculado à instituição, atende solicitações de integrantes dela |
| Educador físico | Dados de desempenho físico dos usuários que atende, dentro da própria instituição | Vinculado à instituição, escopo restrito a atividade física (não é escopo médico) |
| Integrante (institucional) | Próprio histórico | Colaborador de uma instituição parceira (empresa, corporação) |
| Médico-do-trabalho | Dados individuais completos dos integrantes da instituição | Já vinculado à instituição via NR-7/PCMSO |
| Gerente/Comandante | Apenas painel agregado | **Nunca** vê dado clínico individual nominal — só indicadores consolidados (ex: "92% do efetivo com exames em dia") |

Esse desenho existe para que quem tem autoridade hierárquica (gerente, comando militar) nunca tenha acesso a dado que possa, ainda que involuntariamente, influenciar decisões de escala, promoção ou avaliação de desempenho com base em saúde.

## Modelo de Dados (conceitual)
```
Usuario
├─ possui muitos → RegistroSaude (tipo, valor, data)
└─ solicita muitos → Atendimento

Profissional (Médico | EducadorFisico)
└─ realiza muitos → Atendimento

Instituicao
└─ vincula Usuarios com um papel (gerente | médico-do-trabalho | integrante)
```

**Decisão de design a manter:** modelar `Instituicao` como estrutura **auto-referenciada** (`instituicao_pai`) desde o início, mesmo que o MVP inicialmente só use um nível. O piloto institucional (Polícia Militar) provavelmente exige hierarquia multinível (Batalhão → Companhia → Pelotão, cada uma vendo o painel agregado só do seu próprio efetivo). Modelar isso agora custa pouco e evita retrabalho de schema depois — não é necessário esperar a confirmação da PM para começar a modelar.

## Decisão de Arquitetura: Fim do Autocadastro (23/08/2026)

A Rastria **não tem mais cadastro público de pessoa física**. Contas passam a ser **provisionadas administrativamente** pela instituição parceira (import em lote de integrantes, via Django admin) — esse mecanismo, que já estava no roadmap como conveniência, agora é o **único** caminho de entrada no sistema. Não é o mesmo que "tornar o código da corporação obrigatório": o formulário de autocadastro deixou de existir.

**O que não muda:** cada pessoa continua dona do próprio histórico de saúde — isso é regra de propriedade do dado, não de mecanismo de entrada. A conta ter sido criada pela instituição não transfere posse do dado para a instituição; o modelo de acesso segmentado (seção "Domínio — Papéis e Acesso") permanece intacto.

**Compensação:** foi adicionado um botão de **baixar o próprio histórico** (exportação CSV ou PDF gerada no navegador, sem depender de endpoint de backend — lógica em `frontend/src/lib/exportarHistorico.js`; UI em `components/BaixarHistoricoMenu.jsx`). Ficava no `DashboardUsuario`; desde o #88 vive em **Configurações → Meus dados**. Reforça a posse do dado pelo usuário e atende ao direito de portabilidade da LGPD. O CSV neutraliza injeção de fórmula (células iniciadas por `= + - @` recebem prefixo `'`) e leva BOM UTF-8 + CRLF para o Excel. O export cobre os registros de saúde e o último TAF que a tela tem em mão; quando `GET /api/registros-saude` e o histórico de TAF/desempenho físico existirem, montar as seções a partir da resposta completa da API (ver issue #44).

**Pendência real para o backend:** o fluxo de import em lote de integrantes deixou de ser "conveniência" e virou **bloqueante** — sem ele, não existe nenhum caminho para criar conta nova. Priorizar isso assim que o desenvolvimento do backend for retomado.

Documento de decisão completo (contexto, motivação, tabela de mudanças de código): `DECISAO_FIM_AUTOCADASTRO.md` (mantido fora deste repositório — ver "O que Fica de Fora do Repositório"; compartilhado com o time via Drive/Notion).

## Reunião com o Coronel Raumário — Novos Requisitos (22/08/2026)

Levantados a partir de reunião presencial com o piloto institucional (PMAL), registrados como issues no repositório (#1, #5, #6, #7, #8).

**Estrutura real da Junta Médica da PMAL** (resolve a pendência de mapear "médico-do-trabalho" para algo real na corporação): não é um médico individual, é um **colegiado permanente** — oficiais médicos da corporação + médicos civis designados pelo Comandante Geral, com hierarquia interna (presidente = oficial médico de maior precedência; secretário = oficial de menor hierarquia ou médico civil) e apoio multiprofissional (psicólogo, assistente social, técnico em enfermagem). Emite **pareceres formais** que fundamentam decisões administrativas (admissão, retorno ao trabalho, afastamento, aposentadoria).

**Confirmação legal (24/08/2026) — Lei nº 5.346/1992 (Estatuto dos Policiais Militares do Estado de Alagoas):** o nome oficial não é "Junta Médica", é **"Junta Policial Militar de Saúde"** (usar essa nomenclatura no sistema). A lei documenta funções específicas, mais precisas que "admissão/afastamento/aposentadoria" genéricos:
- Homologa incapacidade temporária que leva à reforma, após 18 meses de afastamento (Art. 54, III)
- Atua como grau de recurso para retorno ao serviço de policial reformado por incapacidade (Art. 57)
- Emite parecer para conceder e prorrogar (a cada 30 dias) licença para acompanhar tratamento de pessoa da família (Art. 100)
- Define início e prorroga licença para tratamento de saúde própria (Art. 101)
- Homologa (ou não) atestado de médico especialista externo à corporação — atestado externo sozinho não vale (Art. 101 §2º)

TAF já é terminologia legal estabelecida da corporação (citada no Art. 122, ainda que esse artigo específico tenha sido declarado inconstitucional pelo STF via ADI nº 2620) — confirma que a nomenclatura usada no projeto está alinhada à da PMAL.

**Ainda não esclarecido pela lei:** a composição interna (presidente/secretário/membros, mandato de ~6 meses) descrita pelo coronel não está neste Estatuto geral — deve estar em regulamento ou decreto específico da Junta Policial Militar de Saúde, ainda não localizado. Continua sendo item da reunião futura com a PM (ver "Pontos para Consulta com a PMAL", item 1.4).

**Decisão de modelagem:** generalizar como `AvaliacaoFormal` (processo de avaliação com resultado/parecer) + `MembroAvaliacao` (profissionais participantes, com papel — presidente/secretário/membro), em vez de modelar "Junta Médica" como conceito específico da PMAL. Permite que qualquer instituição cliente configure com 1 ou múltiplos avaliadores, mantendo o produto genérico para outros verticais B2B/B2G.

**Decisão de escopo:** o fluxo completo de `AvaliacaoFormal` (colegiado + parecer + decisão administrativa) fica para **depois do piloto de 30 dias** — processo de alto peso institucional (afeta carreira/aposentadoria), desproporcional ao prazo. Não bloqueia o piloto.

**Novos tipos de profissional confirmados** (genéricos, não específicos da PMAL): `Nutricionista`, `Psicólogo`, `Assistente Social`, `Técnico em Enfermagem` — adicionar como subtipos de `Profissional`, junto dos já existentes `Medico`/`EducadorFisico`.

**TAF — Teste de Aptidão Física (issue #7):** diferente da Junta Médica, **entra no escopo do piloto de 30 dias** — é um teste estruturado aplicado por 1 educador físico (sem colegiado), com componentes fixos (corrida, flexão, abdominal, barra) e critérios de aprovação por idade/sexo definidos em regulamento da corporação. Modelar como tipo estruturado de `RegistroSaude` com múltiplos componentes, não como registro de valor único. **Implementado em `pages/CadastroTAF/`** (commit `64d20b2`) — formulário estruturado com os 4 componentes + resultado apto/inapto; critério de aprovação por idade/sexo ainda não é calculado automaticamente (`resultado` é preenchido manualmente pelo educador físico até essa regra existir no backend).

**Ranking de avaliações físicas / gamificação (issue #6):** sugestão do próprio Coronel, como estímulo à competição saudável. Formato: ranking com nome visível aos colegas (não anônimo), sempre restrito à mesma instituição (nunca cross-instituição). **Mitigação combinada:** cada usuário poder optar por não aparecer no ranking (opt-out individual) — preserva o princípio de autonomia sobre o próprio dado. **Implementado em `pages/RankingFisico/`** (commit `ecf733e`) — ranking por atividade física, filtrado por instituição. **Pendência real:** o opt-out combinado como condição da mitigação **ainda não foi implementado** — hoje todo integrante aparece no ranking sem opção de se ocultar. Não commitar isso como "resolvido" até o opt-out existir.

## Fim da Rede Pré-Qualificada Entre Instituições (24/08/2026)

Decisão tomada durante brainstorming sobre a issue #5: **não existe mais uma rede de médicos/educadores físicos compartilhada entre instituições diferentes.** Profissional agora pertence a uma instituição, do mesmo jeito que integrante — não é mais um pool geral cadastrado na plataforma e disponível para qualquer usuário de qualquer instituição.

**Impacto no que já existe:** a tela `SolicitarAcompanhamento` (e o conceito de `VinculoCuidado`) precisam passar a filtrar profissionais **pela mesma instituição do usuário** — hoje ainda usa lista mockada genérica, sem esse filtro. Atualizar quando o backend de solicitação for implementado.

## Hierarquia da Junta Médica — Brainstorming (24/08/2026)

Conclusões de uma sessão de brainstorming sobre como modelar a composição/hierarquia da Junta Médica (issue #5), aprofundando a decisão de generalização (`AvaliacaoFormal`/`MembroAvaliacao`) registrada acima.

**A composição não é fixa — é um mandato temporal.** A Junta Médica da PMAL muda de composição a cada ~6 meses. Isso significa que não dá para vincular um profissional "à Junta" permanentemente; o vínculo é a uma **gestão específica**, com data de início e fim:

```
GestaoJunta (instituição, data_inicio, data_fim)
 └─ MembroGestaoJunta (profissional, papel: presidente | secretário | membro)
```

Um caso de perícia (`AvaliacaoFormal`) deve referenciar **qual gestão estava vigente** quando o caso foi aberto — preserva corretamente quem decidiu cada parecer, mesmo que a composição mude depois.

**Quem decide o "presidente": o sistema ou uma pessoa?** Decisão: **uma pessoa atribui manualmente**, o sistema não tenta calcular precedência militar sozinho. Regras de precedência têm critérios de desempate (antiguidade, data de promoção) arriscados demais para modelar sem uma fonte oficial validada — errar quem é "legalmente" presidente de uma Junta que decide aposentadoria não é erro tolerável vindo de lógica automática não revisada.

**Encaminhamento pontual a especialista** (trazido pelo Coronel): a Junta pode encaminhar um caso a um médico especialista para parecer técnico específico — isso **não é vínculo de membro da Junta**, é um relacionamento à parte, escopado a um caso:

```
EncaminhamentoEspecialista (avaliacao_formal, profissional, especialidade_solicitada, data)
```

O especialista encaminhado é sempre da própria instituição (consequência direta do fim da rede pré-qualificada entre instituições, ver seção acima) — não existe mais a possibilidade de buscar fora da instituição.

**Decisão sobre conteúdo do laudo:** a Rastria **vai armazenar o laudo/parecer de fato** (não só um status categórico) — decisão tomada em 24/08/2026, revertendo a suposição inicial de que o conteúdo ficaria fora do sistema. Isso eleva a severidade dos requisitos de segurança (ver seção seguinte) de "importante" para **bloqueante antes de qualquer dado real de Junta Médica ser armazenado**.

**Ainda em aberto:** o time vai confirmar em reunião futura com a PMAL qual é, de fato, o papel da Junta Médica dentro do sistema (nem toda essa modelagem está validada institucionalmente ainda — é conclusão de brainstorming interno do time, não confirmação da PMAL).

## Segurança de Dados para Laudos Médicos — Requisitos Bloqueantes (24/08/2026)

Definidos a partir da decisão de armazenar laudo real da Junta Médica (não só resultado categórico). **Nenhum destes itens está implementado ainda** — são pré-requisitos antes de qualquer laudo real (não fictício/mock) ser gravado em produção.

**Base legal (LGPD, art. 11):** consentimento genérico de cadastro não é suficiente para dado desse tipo — usar tutela da saúde e/ou cumprimento de obrigação legal/regulatória (a PMAL já é obrigada, por regulamento próprio, a manter essas perícias). Confirmar com o jurídico da instituição qual hipótese está sendo formalmente adotada.

**Arquitetura técnica — três itens bloqueantes antes de dado real:**
1. **Controle de acesso por objeto** (já registrado como gap crítico em `LEVANTAMENTO_REQUISITOS_VALIDACOES.md`, seção 0) — para laudo de Junta Médica, a mesma falha seria muito mais grave que para registro de saúde comum.
2. **Criptografia em nível de campo/aplicação** para o conteúdo do laudo (ex: `django-cryptography`/`django-fernet-fields`) — criptografia de disco sozinha não protege contra leitura direta via credencial de banco comprometida.
3. **Log de auditoria imutável (append-only)** de toda leitura/alteração de laudo — necessário como prova de integridade caso uma decisão da Junta seja contestada administrativa ou judicialmente.

**Armazenamento de arquivo:** se o laudo for documento (PDF), usar armazenamento de objeto privado (S3-compatível) com URLs assinadas de curta duração — nunca bucket público, nunca link fixo reutilizável.

**Processo/governança (não é código, mas é pré-requisito do piloto real):**
- Nomear formalmente um Encarregado de Dados (DPO), com contato público.
- Elaborar Relatório de Impacto à Proteção de Dados (RIPD) antes do piloto com dado real.
- Confirmar com o jurídico da PMAL o prazo de retenção legal desse tipo de documento (provavelmente décadas, por risco de contestação futura de aposentadoria/afastamento) — não assumir prazo técnico arbitrário.
- Plano de resposta a incidente de vazamento (já registrado como risco geral do projeto) sobe de prioridade dado o teor do dado.

**Recomendação de sequenciamento:** não gravar laudo real em produção até os 3 itens de arquitetura técnica acima existirem e estarem testados.

## Brainstorming: Operação do Piloto (24/08/2026)

Discussão sobre como o piloto de 30 dias no batalhão do BOPE vai funcionar na prática — não confundir com decisão fechada; é levantamento de escopo para alimentar a reunião com a PM que vai definir a data de início. Nada aqui foi implementado ainda.

**Suporte durante o piloto:** decisão inicial foi "o time dá suporte direto", mas isso precisa de estrutura pra não recair só sobre o Guilherme (reforça o risco #11 de bus factor já registrado). Recomendação: escala de plantão entre os 4, um canal único de contato com o efetivo (não mensagens avulsas pra pessoas diferentes do time), e diferenciar dúvida de uso (qualquer um resolve) de bug real de sistema (vai para quem entende o código, principalmente enquanto os itens bloqueantes de segurança não estiverem resolvidos).

**Provisionamento inicial de contas:** a PM envia planilha, o time importa. Ainda faltam definir: (1) formato exato da planilha — proposta: nome completo, posto/graduação, unidade, papel no sistema, contato; (2) como a senha temporária inicial chega a cada pessoa com segurança — não deve ser texto puro em mensagem para todo o efetivo; padrão sugerido é senha temporária aleatória por pessoa + troca obrigatória no primeiro login.

**Métricas de sucesso do piloto:** decisão foi usar uso + feedback combinados. Uso: % de integrantes que logaram ao menos uma vez, número de registros de saúde cadastrados, número de solicitações de acompanhamento feitas/confirmadas. Feedback: entrevista qualitativa com o coronel ao final + pesquisa curta para o efetivo participante. Relevante para a Fase 2 do Centelha (item 4.2.2-b do edital pede evidências do estágio atual de desenvolvimento).

**Estimativa de esforço dos itens bloqueantes** (ver "Segurança de Dados" e riscos #0/#8 já registrados), para embasar a proposta de data de início na reunião com a PM:

| Item | Esforço estimado |
|---|---|
| Deploy do backend + Postgres real | 1–2 dias (majoritariamente configuração — `dj_database_url` já está pronto) |
| Controle de acesso por objeto | 3–5 dias (trabalho real em múltiplos ViewSets + teste por papel) |
| Import em lote de integrantes | 2–3 dias (funcionalidade nova) |
| Opt-out do ranking | ~1 dia |

Total sequencial ~8–11 dias úteis; paralelizável entre os 4. Janela seguinte sugerida antes do piloto poder começar com responsabilidade: **2–3 semanas**. Divisão de tarefas entre os 4 para atacar isso fica para depois — não decidida nesta sessão.

**Ainda em aberto:** data de início será definida em reunião futura com a PM (ainda não marcada nesta sessão).

## Funcionalidades de Frontend Mapeadas (24/08/2026) — Aprovadas pela Equipe (25/08/2026)

Levantamento de gaps discutido item a item. **As 6 funcionalidades com "Desenho fechado" abaixo foram apresentadas e aprovadas por toda a equipe em 25/08/2026 — prontas para virar issue no repositório**, usando os títulos sugeridos em `PONTOS_BRAINSTORMING_24-08.pdf` como ponto de partida.

### Status de implementação (25/08/2026)

Confirmado por commits reais no repositório:

| Item | Status |
|---|---|
| Material de treinamento in-app (tour guiado) | ✅ **Implementado** (`6e22c22`, react-joyride, 4 dashboards, botão de reabrir, persistido em localStorage) — fecha também issue #1 (logo clicável) no mesmo commit |
| Opt-out do ranking (mitigação combinada, ver "Reunião com o Coronel") | ✅ **Implementado** (`fe86855`, closes #14) — toggle em Configurações → Ranking (era "Perfil" até o #88), quem sai some da lista geral |
| Filtro por batalhão no ranking | ✅ **Implementado** (`fe86855`, closes #10) — não estava na lista original de 6, mas relacionado à pendência de hierarquia multinível |
| Flag de exame atrasado no painel do comando | ✅ **Implementado** (`d63a61c`, closes #11) — **feature nova, fora da lista original**. Documentada como exceção deliberada e confirmada com o time à regra de segregação de acesso: mostra status administrativo de pendência (nome + tipo de exame + dias de atraso), nunca o resultado/valor clínico — analogia usada: "sistema de RH mostra treinamento vencido, não o conteúdo do treinamento" |
| Upload de planilha de integrantes | ✅ **Implementado** (01/09/2026, closes #17) — prévia antes de importar, com validação por linha. Formato **CSV**, não xlsx: o pacote `xlsx` do npm tem vulnerabilidades altas sem correção e foi deliberadamente mantido fora (`lib/parseCsv.js` é próprio) |
| Troca de senha obrigatória + login por CPF | ✅ **Implementado** (`pages/PrimeiroAcesso/`, closes #13) |
| Consentimento LGPD | ✅ **Implementado** (`dc3decb`, closes #18) — passo integrado ao fluxo de `PrimeiroAcesso`, termo consultável em `/perfil/termo-consentimento` |
| Central de atendimentos (usuário + profissional) | ✅ **Implementado** (`2a58e8b`, finalizado por `#79`) — duas telas distintas: `HistoricoAtendimentos` (`/usuario/atendimentos`, atendimentos recebidos) e `AtendimentosRealizados` (componente compartilhado médico/educador com escopo `clinico`/`fisico`, `/medico/atendimentos` e `/educador-fisico/atendimentos`, log do que já foi atendido, separado de "Meus pacientes"/"Meus alunos"). Ainda com dado mock — TODO no código aponta para `GET /api/atendimentos`. |
| Estados vazios com call-to-action | 🔲 Ainda não implementado |

**Nota sobre modo escuro:** implementado junto com o tour guiado (`6e22c22`, ajustado em `0b58c84`) — **issue formal #9**, com label "accessibility" (corrigindo registro anterior que descrevia como iniciativa solta fora de qualquer issue). Zustand + Tailwind `darkMode:class`, com correção para abrir em modo claro por padrão (não seguir preferência do sistema automaticamente).

**Limitação de verificação (25/08/2026, resolvida):** lista completa de issues conferida via print enviado pelo usuário. Duas correções sobre o registro anterior: **#10** é "filtro por batalhão no ranking" (não opt-out) e **#14** é "opt-out do ranking" (não filtro) — estavam invertidos no registro de 25/08 anterior. Issue #8 confirmada como o tour guiado ("Criação de guia e material de apresentação"). Issue #9 (modo escuro) era issue formal de verdade, com label "accessibility" — não foi iniciativa solta fora do processo como registrado antes.

**Issues abertas adicionais, não previstas nesta lista:**
- **#12** "Confirmar na Reunião" — corresponde aos pontos do `PONTOS_CONSULTA_PMAL.pdf`, já seguido como issue própria.
- **#13** "Criar tela de onboarding - Login Primário" — **é a mesma issue que a sugestão "troca de senha obrigatória + login por CPF" desta lista**. Já está aberta, não abrir duplicata.
- **#15** "Corrigir SolicitarAcompanhamento (filtrar por instituição, fim da rede)" — é exatamente o ajuste documentado em "Fim da Rede Pré-Qualificada Entre Instituições" acima. Já rastreado.
- **#16** "Tela de Encaminhamento a Especialista pela Junta Médica (verificar em reunião)" — relacionado aos itens pausados da Junta Policial Militar de Saúde.

**Inconsistência conhecida:** issue #3 ("Implementar Tela de Autorização do Usuário") está fechada, mas o código correspondente (`AutorizacaoUsuario.jsx`) foi **removido** posteriormente pela decisão de fim do autocadastro (23/08/2026). A issue permanece fechada como registro histórico do que foi feito na época — não é necessário reabrir, mas vale que a equipe saiba que "fechada" aqui não significa "existe no código hoje".

**Issues que ainda precisam ser abertas** (das 5 originalmente especificadas, apenas 1 já existia como #13):
1. Upload de planilha de integrantes com prévia
2. Tela de consentimento LGPD no primeiro acesso
3. ~~Histórico de atendimentos (usuário e profissional)~~ — aberta como **#79**, implementada (`2a58e8b`, finalizada por `#79`)
4. Estados vazios com call-to-action

**Decorrentes do brainstorming de operação do piloto (seção acima):**
- Upload de planilha de integrantes dentro do painel do gerente (alternativa a depender só do Django admin para o fluxo recorrente de provisionamento). **Desenho fechado (24/08/2026), aprovado pela equipe (25/08/2026):** aceitar upload em `.xlsx` e `.csv`; após upload, mostrar **prévia** dos registros para revisão de erros antes de confirmar a criação real das contas (não importar direto). **Colunas finais** (decisão de 25/08/2026, substitui lista anterior): nome completo, CPF, data de nascimento, sexo, telefone (ou e-mail institucional — a confirmar com a PMAL). Posto/graduação e unidade ainda precisam ser confirmados como colunas ou não. Distribuição da senha inicial: **link individual de ativação por SMS/WhatsApp** (ou e-mail, se a PMAL tiver e-mail institucional — não enviar a senha temporária em texto puro — reaproveitar o mesmo padrão de link com token já usado em "Esqueci minha senha", aplicado ao primeiro acesso). Descartado: gerente/comando distribuir credenciais manualmente — contradiz o princípio de que o comando não deve ter acesso a nada tão individual quanto a credencial de um subordinado (mesmo racional do risco #1). Fallback para quem não tiver contato cadastrável: lista impressa, tratado como exceção manual, não como processo padrão.
- ~~Troca de senha obrigatória no primeiro login~~ — **desenho fechado (24/08/2026):** login passa a ser o **CPF** (com validação de dígito verificador, não só formato — mesmo padrão do gov.br; resolve integrante sem e-mail institucional). Senha temporária gerada no provisionamento **bloqueia** qualquer ação até ser trocada (não é sugestão opcional). Regra da nova senha: mínimo 8 caracteres, 1 maiúscula, 1 número, 1 símbolo. Cuidado de privacidade: CPF nunca aparece em URL (só em campo de formulário/token); considerar mascarar CPF em telas de listagem que outros papéis podem ver de relance (ex: painel do gerente) — mostrar só os 3 primeiros dígitos.
- Tela/passo de consentimento explícito (LGPD) — já é requisito do risco #3, nunca virou tela. **Desenho fechado (24/08/2026):** aparece junto com a troca de senha obrigatória, no mesmo fluxo de primeiro acesso (não é passo separado). Termo único, mas estruturado internamente em seções por tipo de dado (ex: dados de saúde, desempenho físico, acesso institucional) — não é consentimento granular com aceite por seção, é um único aceite ao final da leitura. Não é revogável pelo usuário, mas fica **sempre disponível para consulta** (ex: link em "Perfil"). Nota para o futuro (não bloqueia agora): se o conteúdo do termo mudar depois, vai precisar de controle de versão do termo aceito — não implementar isso agora, só ter em mente. Lembrete: esse consentimento documenta transparência, mas **não substitui** a base legal formal (tutela da saúde/obrigação legal) definida para o dado mais sensível — ver "Segurança de Dados para Laudos Médicos".

**Ligadas à Junta Médica (fluxo pesado continua adiado — ver seção dedicada):**
- Gestão de composição da Junta — definir presidente/secretário/membros da `GestaoJunta` vigente, com data de início/fim de mandato. **Discussão de desenho pausada (24/08/2026):** aguardando reunião futura com a PM sobre o papel real da Junta no sistema (pendência já registrada acima) — não faz sentido fechar telas antes dessa definição.
- Abertura de caso de `AvaliacaoFormal` — selecionar integrante + motivo (admissão/retorno/afastamento/aposentadoria). **Também pausada pelo mesmo motivo.**
- Registro do parecer — **bloqueado** até os requisitos de segurança (criptografia de campo, log de auditoria) existirem. Não desenhar a tela antes da base de segurança estar pronta.

**Qualidade de vida / gaps que passaram despercebidos:**
- Central de atendimentos concluídos (hoje só existe "pendente"; falta histórico do que já foi atendido). **Desenho fechado (24/08/2026):** são **duas telas distintas**, não uma vista de dois ângulos — (1) do lado do usuário/integrante: histórico de atendimentos recebidos (quem consultou, quando, resumo), complementar ao histórico de exames que já existe; (2) do lado do médico/educador físico: log de atendimentos já realizados, separado da lista "Meus pacientes"/"Meus alunos" do `DashboardMedico`/`DashboardEducadorFisico` (que mostra responsabilidade atual, não histórico). Ambas entram no escopo — nenhuma foi descartada. **✅ Implementado (issue #79):** `HistoricoAtendimentos` e `AtendimentosRealizados` (componente compartilhado, escopo `clinico`/`fisico`, cada linha lincando para o detalhe do integrante); dado ainda mock.
- Estados vazios (o que aparece para um integrante novo sem nenhum registro ainda). **Desenho fechado (24/08/2026):** não é só informativo — a tela vazia já vem com um botão guiando ativamente para a primeira ação (ex: "Cadastrar seu primeiro exame"), em vez de deixar a pessoa procurar sozinha o menu.
- Material de treinamento in-app (issue #8). **Desenho fechado (24/08/2026):** formato definido como **tour guiado dentro do próprio app** (dicas/tooltips destacando elementos da tela), não vídeo, não página estática, não PDF para download. Avaliação de discussões anteriores sobre conectar isso a "central de atendimento" e "estados vazios" como um fluxo único foi descartada — as três funcionalidades são tratadas de forma independente. Nota técnica para implementação: considerar biblioteca de tour guiado para React (ex: react-joyride) em vez de construir do zero.

**Dados pessoais complementares — decisão final da equipe (25/08/2026)**

Ponto em aberto apresentado para o restante do time e **aprovado com solução híbrida** (não foi "opção A ou B" — combina as duas):

**Vem pronto na planilha da PM** (colunas finais, substituindo a lista anterior de "nome, CPF, posto/graduação, unidade, papel, telefone"):
- Nome completo
- CPF
- Data de nascimento
- Sexo
- Telefone (para receber a senha temporária) — **pendente de confirmação:** verificar se a PMAL tem e-mail institucional para usar nesse campo no lugar do telefone. Atualizar aqui assim que confirmado.

**Vira dado complementar, preenchido pelo próprio usuário** (não vem na planilha):
- Tipo sanguíneo
- Contato de emergência (nome + telefone)

Posto/graduação e unidade, que estavam na lista original de colunas da planilha, precisam ser confirmados se continuam — não foram mencionados na decisão da equipe. Verificar antes de fechar o layout final da planilha.

**Ainda em aberto:** se o destino do preenchimento complementar (tipo sanguíneo, contato de emergência) deve ser o `Onboarding.jsx` que já existe, ou se esse conteúdo deveria migrar para dentro do `Perfil` — a equipe não se pronunciou sobre isso especificamente.

**Decisão já tomada, não reabrir:** dado clínico/condição de saúde pré-existente **não** deve virar campo de texto livre em Perfil/Onboarding — se esse tipo de informação precisar existir, nasce como `RegistroSaude` de verdade, com todo o controle de acesso e consentimento que isso já exige.

**Correção de implementação (26/08/2026):** `Onboarding.jsx` e `Perfil.jsx` tinham um campo "Idade" editável e independente, que não deveria existir — idade **nunca** é um valor digitado/armazenado separadamente, é sempre calculada a partir da data de nascimento (que, como definido acima, vem da planilha da instituição, não do usuário). Corrigido: campo removido dos dois formulários; `Perfil.jsx` agora exibe data de nascimento + idade calculada como informação somente leitura, no mesmo padrão do campo E-mail.

## Fluxos Principais
1. **Cadastro e verificação** — usuário cadastra exame/índice → sistema verifica contra tabela de referência → resultado exibido (normal/atenção/alterado).
2. **Solicitação de acompanhamento** — usuário solicita → sistema notifica profissionais disponíveis na especialidade **dentro da mesma instituição** → profissional confirma (**não** é aceite instantâneo tipo "corrida") → atendimento registrado no histórico.
3. **Modelo institucional** — integrante cadastra dados → médico-do-trabalho analisa dado individual → gerente/comando vê apenas painel agregado.

## Regras de Design que Não Devem Ser Quebradas
- **Segregação de acesso por papel** é a garantia central vendida ao cliente institucional — nunca expor endpoint que dê a um papel de comando/gerência acesso a dado clínico individual nominal, mesmo que pareça conveniente para uma feature.
- **Conexão com profissionais é solicitação → confirmação, não matching instantâneo.** Essa escolha é deliberada: evita o enquadramento do Parecer CFM nº 15/2026 como "ambiente médico virtual" pleno (que exigiria diretor técnico/clínico formal). Não implementar aceite automático/instantâneo sem entender essa implicação regulatória.
- **Tabela de regras da verificação automática deve ser versionada no banco, não hardcoded** — permite correção rápida se uma faixa de referência clínica estiver incorreta, sem precisar de deploy.
- **Dado de saúde é dado sensível sob a LGPD** (Lei nº 13.709/2018) — exigir consentimento explícito e específico por finalidade; nunca reaproveitar um consentimento genérico de cadastro para autorizar compartilhamento de dado clínico.
- **Educador físico tem escopo segregado do escopo médico** (CONFEF/CREF) — não deve ter acesso a dado clínico fora de desempenho físico.
- **Acessibilidade: preferência do usuário mora em Configurações › Acessibilidade** (`features/acessibilidade/store.js`); correção de conformidade (WCAG 2.2 AA / eMAG) vale para todos e não vira opção. Toda tela tem exatamente um `<main>` via `components/ConteudoPrincipal.jsx` — é o alvo do "Pular para o conteúdo" e do Alt+1; tela sem ele quebra os dois em silêncio. Auditoria e plano em #152.

## Compliance (referência rápida)
- **LGPD** — dado de saúde é dado sensível; consentimento específico, acesso individual restrito ao profissional responsável.
- **NR-7/PCMSO** — o modelo institucional (gerente vê agregado, médico-do-trabalho vê individual) digitaliza uma obrigação legal já existente.
- **CFM Parecer nº 15/2026** — plataformas que intermediam atos médicos com matching instantâneo são tratadas como "ambiente médico virtual" (exige diretor técnico/clínico); o modelo de solicitação → confirmação com continuidade de cuidado evita esse enquadramento pleno, mesmo com o profissional já sendo da própria instituição (não é uma rede aberta entre instituições diferentes — decisão de 24/08/2026, ver seção dedicada).
- **CONFEF/CREF** — profissionais precisam de registro verificado; escopo do educador físico é segregado do escopo médico.

## Escopo do MVP (fatias mínimas por pilar)
| Pilar | MVP | Depois |
|---|---|---|
| Cadastro & Histórico | Cadastro manual estruturado por tipo de exame/índice; timeline visual; **TAF** (Teste de Aptidão Física, estruturado em componentes — ver "Reunião com o Coronel") | Upload de PDF/foto com OCR; compartilhamento seletivo granular |
| Verificação Automática | Tabela de regras fixas (faixa min/max por tipo de exame); indicador normal/atenção/alterado | Análise de tendência ao longo do tempo (Mann-Kendall); alertas automáticos |
| Conexão com Profissionais | Cadastro de profissionais com CRM/CREF verificado manualmente; solicitação → listagem de compatíveis → confirmação; contato efetivo fora da plataforma (WhatsApp/email) | Verificação automática de registro profissional; chat/vídeo embutido |
| Institucional (B2B/B2G) | Cadastro em lote de integrantes (import CSV); painel de comando com agregado por unidade | Estrutura de diretor técnico/clínico; atendimento pleno |

## Deploy
Railway, builder Nixpacks. O serviço na raiz builda e serve o `frontend/`:
- `buildCommand` ([railway.json](../railway.json)) roda `npm run build` da raiz ([package.json](../package.json)), que instala e builda `frontend/` (`npm install --prefix frontend && npm run build --prefix frontend`).
- **Versão de Node:** fixada em **22** via `.nvmrc` na raiz + `engines.node >=22.12.0` (raiz e `frontend/`). O Nixpacks sem isso provisiona um Node antigo que o Vite 8 / `@vitejs/plugin-react` 6 / rolldown não aceitam (`^20.19.0 || >=22.12.0`) — foi o que quebrou o deploy depois dos merges de #106/#107.
- `startCommand` serve o build estático: `serve -s frontend/dist -l $PORT`.
- `VITE_API_URL` é lida em **build-time** pelo Vite — precisa estar setada como variável de ambiente do serviço no Railway (não só no `.env` local) para o build embutir a URL certa da API.
- **Headers de segurança (issue #111):** `frontend/public/serve.json` (copiado para `dist/` no build) faz o `serve` injetar `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e `Strict-Transport-Security` em toda resposta. O `connect-src` da CSP está em `https://*.railway.app` — **fixar na origem real da API** quando o backend for deployado (ou se entrar domínio próprio). Uma CSP de reforço vai como `<meta http-equiv>` no `index.html` do build, injetada pelo plugin `rastria-csp-meta-tag` do `vite.config.js` (`apply: "build"` — não roda no dev server).

O backend (`backend/`) ainda não tem serviço próprio no Railway — ver "Estado Atual do Repositório". Cada subpasta já tem seu próprio `railway.json` (`frontend/railway.json`, `backend/railway.json`) prontos para o dia em que forem promovidos a serviços Railway separados (apontando o "root directory" de cada serviço no dashboard); até lá, é o `railway.json`/`package.json` da raiz que valem para o único serviço existente.

## Modelo de Negócio (contexto, não afeta arquitetura diretamente)
- Licença institucional (B2B/B2G) — cobrança por integrante ativo.
- Comissão por atendimento (marketplace) — % sobre consultas realizadas pela rede.

## Identidade de Marca
Fonte: Manual de Marca v1.0 (2026), versionado em `docs/brand/Rastria_Manual_de_Marca.pdf`.

**Tagline:** "O rastro dos seus dados, o caminho até o cuidado certo."

**Logo:** símbolo de pulso que se transforma a partir de um traço/rastro, com wordmark em peso forte — o traço remete a "rastro", o pulso remete a sinal vital monitorado. Versão primária sobre fundo branco/claro; versão reversa sobre Primary Teal ou preto. Espaço de proteção: margem livre ao redor da logo equivalente à altura do círculo verde do símbolo. Tamanho mínimo: 24mm de largura em material impresso, 120px em telas.

**Paleta de cores** — Primary Teal domina composições (60–70%); Seafoam e Coral são toques de destaque, **nunca com peso visual igual entre si** (escolher um como protagonista do destaque e o outro como apoio pontual):

| Cor | Hex | RGB | Uso |
|---|---|---|---|
| Primary Teal | `#0C4A44` | 12, 74, 68 | Fundos de destaque, títulos, texto de marca (dominante) |
| Seafoam | `#14B892` | 20, 184, 146 | Acentos, ícones, indicadores positivos |
| Coral | `#FF6B4A` | 255, 107, 74 | CTAs, chamadas de atenção, destaques pontuais — usar com moderação |
| Texto escuro | `#1B2C29` | — | Texto de corpo sobre fundo claro |
| Texto muted | `#5B6B67` | — | Texto secundário |
| Tint de fundo | `#F2F8F6` | — | Fundos suaves |
| Branco | `#FFFFFF` | — | Fundo primário, texto sobre fundo escuro |
| Coral escuro | `#B8431F` | 184, 67, 31 | **Coral em texto, ícone ou fundo com texto branco** sobre fundo claro (5,4:1). No tema escuro volta o Coral original |
| Seafoam escuro | `#0B7A5E` | 11, 122, 94 | **Seafoam em texto, ícone ou fundo com texto branco** sobre fundo claro (5,3:1). No tema escuro volta o Seafoam original |
| Borda de campo | `#7C8C88` | — | Contorno de input/select/textarea (3,5:1) — `line` fica só para separadores |

**Acessibilidade das cores (issue #137):** Seafoam e Coral originais têm só ~2,5–2,8:1 sobre branco — abaixo dos 4,5:1 que o WCAG exige para texto e dos 3:1 para ícones e bordas de controle. Continuam valendo como cor de marca em ilustração, faixa decorativa, barra e fundo translúcido; **para texto sobre fundo claro, sempre a variante escura** (`text-coral-escuro`, `text-seafoam-escuro`). O manual de marca em PDF (`docs/brand/`) ainda não traz essas variantes — atualizar na próxima revisão dele.

**Tipografia** — serifada forte para títulos, sans-serif limpa para corpo (ambas fontes padrão do Office, sem precisar embutir):

| Uso | Fonte | Tamanho |
|---|---|---|
| Título de slide/seção | Cambria Bold | 32–44pt |
| Subtítulo/kicker | Calibri Bold | 12–13pt |
| Corpo de texto | Calibri Regular | 12–16pt |
| Legendas/notas | Calibri Regular | 9–11pt |

No frontend web, `pt`/`px` viram a base para uma escala responsiva equivalente em `rem`/Tailwind — não usar os tamanhos em pt literalmente no CSS.

**Fontes no app web:** Cambria/Calibri são a escolha do manual para materiais impressos/Office (compatibilidade sem embutir fonte), mas não são boas fontes web. As telas do produto (a partir do design de Login/Cadastro) usam **Lora** (títulos, via Google Fonts) e **Inter** (corpo) — carregadas em `frontend/index.html` e mapeadas em `tailwind.config.js` como `font-heading`/`font-body`. `h1`/`h2`/`h3` já puxam `font-heading` automaticamente via `@layer base` em `src/styles/index.css`.

**Sistema de componentes visuais do app:** `src/styles/index.css` (`@layer components`) já tem classes reutilizáveis extraídas do design das telas — `.btn-primary`/`.btn-outline`, `.badge-normal`/`.badge-atencao`/`.badge-alterado` (indicador normal/atenção/alterado da verificação automática), `.nav-item`/`.nav-item.active`, `.card-registro`/`.card-registro.atencao`. Reaproveitar essas classes ao portar novas telas do mesmo design system, em vez de recriá-las inline. Cores extras usadas pelo design: `primary-dark` (`#083430`, hover do botão primário) e `line` (`#E4E4E4`, bordas de input/card).

Componentes React reutilizáveis já existentes em `src/components/`: `Logo` (ícone+wordmark, prop `reverse`), `AuthBrandPanel` (painel teal com watermark usado por `Login`/`Cadastro` — recebe `heading`/`subtitle`), `DashboardLayout` (shell com sidebar + header usado pelas 4 telas de painel). Reaproveitar antes de duplicar markup.

**Regras de aplicação:**
- Faça: versão primária sobre fundo claro; versão reversa sobre Primary Teal/preto; respeitar o espaço de proteção; manter Primary Teal dominante; usar Coral com moderação.
- Evite: distorcer/inclinar/esticar a logo; alterar as cores do símbolo ou da wordmark; usar a versão primária sobre fundo escuro; sombras/contornos/efeitos 3D; usar Coral e Seafoam com o mesmo peso visual.

`frontend/tailwind.config.js` já mapeia `primary`/`seafoam`/`coral` e `font-heading`/`font-body` para esses tokens — ao adicionar UI nova, usar essas classes em vez de hardcodar hex ou fontes.

## Pendentes que dependem da PMAL

Issues que não são de implementação — esperam definição da corporação e estão listadas em `docs/PONTOS_CONSULTA_PMAL.pdf`. Ficam registradas aqui para não se perderem entre as issues técnicas:

- **#5** — criação de cargos específicos (Junta Médica, Departamento de Educação Física, Departamento de Nutrição)
- **#12** — confirmar na reunião (pontos em aberto acumulados)
- **#16** — tela de encaminhamento a especialista pela Junta Médica
- **#30** — cálculo automático do resultado do TAF (depende da tabela oficial da corporação)
- **#57** — aba de acompanhamento psicológico (sugestão)
- **#100** — importar dados de exercício físico de apps externos (Strava)

## Documentação adicional
Manual de marca (`docs/brand/Rastria_Manual_de_Marca.pdf`), pitch deck (`docs/pitch/Rastria_Pitch_Deck.pdf`/`.pptx`) e diagramas UML (`docs/diagrams/casos_de_uso.svg`, `classes.svg`, `sequencia.svg`, `fluxo_institucional_corrigido.svg`) já estão versionados no repositório. A estratégia de estrutura/branches acima já foi incorporada neste arquivo, não é necessário um `docs/ESTRUTURA_REPOSITORIO.md` separado.

## Changelog

Log de correções e mudanças pontuais que não têm uma seção narrativa própria acima — decisões maiores continuam documentadas nas seções dedicadas (Fim do Autocadastro, Reunião com o Coronel, etc.).

**26/08/2026**
- **fix:** idade removida como campo editável em `Onboarding.jsx`/`Perfil.jsx` — passa a ser calculada a partir da data de nascimento (que vem da planilha da instituição), exibida como somente leitura no Perfil.
- **chore:** removidas todas as menções ao Programa Centelha nas páginas do app (rodapé da Landing, `AuthBrandPanel`).
- **fix:** alinhamento do ícone da logo corrigido (`viewBox` do SVG recentralizado) — o desenho ocupava só a metade inferior da caixa original, ficando visualmente deslocado em relação ao texto "Rastria".
- **bug:** campos de formulário ilegíveis no modo escuro — nenhum `<input>`/`<select>` do app tinha a classe `bg-white`, então o texto digitado herdava a cor clara global do `<body>` em modo escuro sem um fundo escuro correspondente por trás. Corrigidos 24 campos em 9 arquivos; confirmado via varredura que não resta nenhum caso.
- **fix:** cards com texto longo (nome de integrante) estourando ou desalinhando em telas pequenas — padrão `flex items-center justify-between` sem `min-w-0`/`truncate` no texto nem `shrink-0` no badge/botão ao lado, em ~10 telas de lista. Caso mais grave: "Solicitações pendentes" em `DashboardMedico`/`DashboardEducadorFisico`, com dois botões ao lado do nome.
- **bug:** menu mobile da Landing sobrepondo o conteúdo da página, reportado em produção. Causa: `<header>` com `backdrop-blur` virava *containing block* do menu (`position: fixed`) em navegadores WebKit/Blink, prendendo o overlay dentro da caixa baixa do header em vez de cobrir a tela inteira. Corrigido extraindo o menu para `createPortal` direto em `document.body`.
- **enhancement:** botão "Entrar" da Landing (desktop e mobile) alinhado visualmente ao mesmo destaque do "Fale com o time" (`btn-outline`).

**27/08/2026**
- **feat:** cria `PasswordInput` (componente reutilizável, botão de mostrar/ocultar senha), aplicado em `Login`, `PrimeiroAcesso` e o novo `RedefinirSenha`.
- **fix:** `EsqueciSenha.jsx` volta a usar e-mail como identificador (não CPF) — CPF é o identificador de login, e-mail é o canal de entrega do link de redefinição.
- **feat:** cria `RedefinirSenha.jsx` (rota `/redefinir-senha/:token`), destino do link enviado por e-mail. Mesmo mecanismo de token de uso único do `PrimeiroAcesso` (mesmo endpoint de backend, `POST /api/auth/primeiro-acesso/:token/`), texto adaptado ao contexto de quem já tem conta e esqueceu a senha.
- **backend (ambiente de teste, não deployado):** confirmado via teste real (SQLite + `runserver`) que login por CPF + troca de senha obrigatória funciona de ponta a ponta. Implementados `Usuario.cpf`/`data_nascimento`/`sexo`/`telefone`/`senha_temporaria`, `RastriaTokenObtainPairSerializer` (devolve `senha_temporaria` no login), `TrocarSenhaView` (exige login + senha atual) e `TokenAtivacao`/`PrimeiroAcessoView` (fluxo público por token, sem exigir login — usado tanto por primeiro acesso quanto por esqueci senha). Ver seção de teste completo mais abaixo se existir, ou histórico de commits.
- **mapeamento:** 7 issues novas mapeadas para o frontend — upload de planilha de integrantes, trocar senha no Perfil, decisão de destino de tipo sanguíneo/contato de emergência (Onboarding vs Perfil), cálculo automático do resultado do TAF, notificações in-app, busca/filtro em listas, páginas de Termos de Uso e Política de Privacidade. Detalhamento completo em `ISSUES_MAPEADAS_27-08.txt` (compartilhado com a equipe, não versionado no repositório). Classificação Frontend/Backend registrada no mesmo arquivo — estratégia da equipe é só iniciar backend novo depois da reunião com a PM (backend já existente e testado, como login por CPF, não conta como "novo").
- **feat (closes #33):** cria `/termos-de-uso` e `/politica-de-privacidade`, páginas públicas (sem exigir login). `PoliticaDePrivacidade` reaproveita `TERMO_CONSENTIMENTO` (mesmo conteúdo por tipo de dado do termo de consentimento) em vez de duplicar, complementando com direitos do titular (art. 18 LGPD), base legal, retenção e DPO. Ambas com aviso de rascunho estrutural, pendente de revisão jurídica antes de produção. Rodapé da Landing ganha coluna "LEGAL" linkando as duas.
- **feat (closes #32):** cria `CampoBusca` (componente reutilizável, filtro client-side sem debounce — dado hoje é mockado, sem custo de performance a mitigar), aplicado em "Meus pacientes" (`DashboardMedico`), "Meus alunos" (`DashboardEducadorFisico`) e `RankingFisico`. No Ranking, busca complementa o filtro por batalhão já existente (issue #10) — são independentes; busca filtra exibição mas nunca recalcula posição no ranking.
- **fix/feat (closes #44):** o "Baixar histórico" do `DashboardUsuario` deixa de exportar só os 3 registros da tela e de ser vulnerável a CSV injection. Nova lib `frontend/src/lib/exportarHistorico.js` (`escaparCelulaCsv`, `gerarCsvHistorico`, `gerarPdfHistorico`, `baixarHistorico`): CSV com BOM UTF-8 + CRLF (RFC 4180) e neutralização de fórmula (prefixo `'` em células iniciadas por `= + - @` / TAB / CR, aspas duplas dobradas); PDF gerado com `jspdf` (dependência nova, import dinâmico — só entra no bundle ao baixar). O botão virou menu com "Baixar em CSV" / "Baixar em PDF" (fecha ao clicar fora ou `Esc`). O arquivo agora inclui exames/índices **e** o último TAF; quando `GET /api/registros-saude` e o histórico de TAF/desempenho físico existirem, `montarDadosHistorico` deve passar a montar as seções a partir da resposta completa da API.

**29/08/2026**
- **feat (closes #28):** adiciona o card "Trocar senha" em `Perfil.jsx` — campos "Senha atual", "Nova senha" e "Confirmar nova senha", cada um usando o `PasswordInput` (olhinho de mostrar/ocultar). Validação client-side em `trocarSenhaSchema` (Zod, instância de form separada da de peso/altura): reaproveita `senhaForteSchema` de `lib/senha.js` (8 caracteres, 1 maiúscula, 1 número, 1 símbolo), exige que a confirmação coincida e que a nova senha seja diferente da atual. Envio **mockado** (toast + reset), como os demais formulários de auth do frontend; `TODO` aponta para a mutation do TanStack Query contra `POST /api/auth/trocar-senha/` enviando `{ senha_atual, nova_senha }`, com 400 (senha atual incorreta) reportado no próprio campo. A `TrocarSenhaView` já foi implementada e testada localmente (ver entrada de 27/08), mas ainda não está commitada nem deployada — por isso o front continua mockado até o backend ir para o repositório. Remove "trocar senha no Perfil" da lista de issues de frontend pendentes do `**mapeamento:**` de 27/08.
- **feat (closes #34):** adiciona favicon. Novo `frontend/public/favicon.svg` — o símbolo de pulso/rastro da marca (mesmo desenho de `components/Logo.jsx` e `public/og-image.svg`) sobre um quadrado arredondado Primary Teal (`#0C4A44`), legível em abas de tema claro e escuro. `index.html` referencia via `rel="icon"` (SVG), `apple-touch-icon` e `mask-icon`. SVG único, sem gerar `.ico`/`.png` — mesmo padrão já adotado para a imagem de Open Graph.
- **fix (closes #37):** os campos de data dos formulários de cadastro (exame, exercício físico, TAF) aceitavam datas inexistentes (`31/02/2099`) e futuras — a validação era só a regex de formato `dd/mm/aaaa`. Nova `frontend/src/lib/dataRegistro.js` (`dataRegistroSchema`, `parseDataRegistro`) como fonte única de verdade: além do formato, o `parse` do date-fns rejeita dia inválido para o mês/ano (31/02, 29/02 em ano não bissexto, dia 00, mês 13) e um `refine` barra data no futuro. Aplicada em `CadastrarExameModal.jsx`, `CadastroExercicioFisico.jsx` e `CadastroTAF.jsx`, substituindo o schema inline duplicado nos três.
- **fix (closes #41):** peso e altura no `Onboarding` e no `Perfil` usavam `z.coerce.number().positive()`, que aceitava 0.1 kg, 3 cm, 99999 e "1.70" digitado no campo de altura (virava 1,7 cm) — tudo alimentando o cálculo automático de IMC. Nova `frontend/src/lib/medidasCorporais.js` (`medidasCorporaisSchema`, `pesoKgSchema`, `alturaCmSchema` + constantes de faixa) com faixas de sanidade — peso 25–300 kg, altura 100–250 cm — e mensagem de campo vazio separada da de faixa. As duas telas passam a importar o schema compartilhado, com `min`/`max` nos `<input type="number">` e a dica "em centímetros, não em metros" abaixo do campo de altura.
- **a11y (closes #42):** formulários e modal sem suporte a teclado/leitor de tela. (1) Mensagens de erro agora se associam ao campo: novo `<FieldError>` (`components/FieldError.jsx`, `<p role="alert" id>`) + helper `fieldErrorProps` (`lib/fieldA11y.js`, adiciona `aria-invalid`/`aria-describedby`), aplicados em Login, EsqueciSenha, RedefinirSenha, PrimeiroAcesso, Onboarding, Perfil, `CadastrarExameModal`, `CadastroExercicioFisico` e `CadastroTAF`; a dica de unidade/força de senha entra no `aria-describedby` junto com o erro. (2) `PasswordInput` — o botão de mostrar/ocultar deixa de ter `tabIndex={-1}` (era inalcançável por teclado) e ganha `aria-pressed`. (3) Novo `components/Modal.jsx` — diálogo acessível reutilizável (`role="dialog"`, `aria-modal`, `aria-labelledby`, foco preso e devolvido a quem abriu, `Esc` e clique no backdrop fecham, scroll do fundo travado, portal em `document.body`); `CadastrarExameModal` passa a usá-lo.
- **bug (closes #69):** `frontend/src/styles/index.css` só definia `background-color` em `.dark body` — no tema claro (padrão do app) o `<body>` ficava transparente, e as telas públicas sem fundo próprio (Landing, lado direito do Login, área ao redor do card do Onboarding) renderizavam texto `text-text-muted` sobre fundo quase preto em qualquer ambiente que respeite `color-scheme` dark (SO em modo escuro no celular, Dark Reader). Corrigido em `@layer base`: `body` ganha `bg-white` explícito e `:root` declara `color-scheme: light` (`:root.dark` → `dark`), o que também faz o navegador parar de aplicar auto-dark por `prefers-color-scheme` no tema claro. Não foi usado `<meta name="color-scheme">` fixo porque o app tem tema escuro real (toggle em `features/theme/store.js`); o `.dark body` continua sobrescrevendo o fundo (regra fora de `@layer`, com prioridade sobre a base).
- **fix (closes #66):** "Baixar histórico" (CSV/PDF) não funcionava no Firefox. `baixarBlob` (`frontend/src/lib/exportarHistorico.js`) criava o `<a>` só na memória e chamava `.click()` sem anexá-lo ao documento — em navegadores baseados em Gecko o clique num anchor desconectado do DOM não dispara o download. Além disso, `URL.revokeObjectURL` era chamado de forma síncrona logo após o `.click()`, o que podia cortar o download de arquivos maiores. Corrigido: o link é anexado a `document.body` antes do clique e removido depois, e a revogação da object URL foi adiada com `setTimeout(..., 0)`. É a funcionalidade que a decisão "Fim do Autocadastro" define como a garantia de portabilidade LGPD do próprio dado pelo usuário.
- **polish (closes #70):** referências internas ao arquivo de dev apareciam renderizadas na tela do cliente — "(ver \"Regras de Design\" em agents/claude.md)" nos avisos de segregação de acesso de `DashboardGerente`, `DashboardEducadorFisico` e `TelaPorUnidade`. Reescritos em linguagem de usuário, sem citar o arquivo (ex.: "Este painel mostra apenas indicadores agregados por unidade e status administrativo de pendência — nunca resultados ou valores clínicos individuais."). `DetalheIntegrante` já tinha o texto renderizado limpo (a citação ali era só comentário de código, que não vai para a UI). Comentários de código com `agents/claude.md` foram mantidos — não são visíveis ao usuário.
- **nota #71 (já resolvida por #39):** a issue #71 ("Landing ainda anuncia 'rede pré-qualificada'") já estava corrigida no `main` pelo commit `3f7d17f` (closes #39) — o passo 3 de "Como funciona" em `Landing.jsx` já diz "Acesse médicos e educadores físicos da sua própria instituição, com continuidade de cuidado.", exatamente o texto sugerido na #71. Varredura da Landing não achou nenhuma outra menção a rede aberta/pool geral. #71 é duplicata; fechar como resolvida por #39.

**30/08/2026**
- **feat/security (closes #61):** `routes/index.jsx` expunha todas as rotas de painel (`/gerente`, `/medico`, `/educador-fisico`, `/usuario/*`, `/perfil`) sem nenhuma guarda — qualquer visitante abria o Painel do Comando direto pela URL. Novo `frontend/src/features/auth/RotaProtegida.jsx`: sem login → redireciona pro `/login` (guardando a rota tentada em `location.state.from`); logado com papel fora da lista permitida → redireciona pra tela inicial do papel dele (`caminhoInicialDoPapel`, novo helper em `features/auth/roles.js`, derivado de `ROLES[].path`). As rotas foram reagrupadas por papel atrás de `<Route element={<RotaProtegida papeis={[...]} />}>`; `/perfil` e `/perfil/termo-consentimento` exigem só estar logado (qualquer papel). Telas de acesso (login, primeiro acesso, redefinição, onboarding) e páginas institucionais públicas (landing, termos, política) seguem sem guarda. Para a proteção não quebrar o fluxo de review com mock (recarregar a página perdia o `usuario` em memória e jogava pro login), o `useAuthStore` agora espelha `usuario` em `localStorage` (`rastria:usuario`), limpo no `logout` junto das demais chaves; o formulário real de login (ainda mock) passa a popular o store como `usuario` antes de navegar. **Continua sendo só camada de apresentação** — a autorização de verdade é do backend (ver "Padrão de Arquitetura"); isto é a fundação estrutural pedida na issue, para não integrar a API real com as rotas abertas. TODO no código aponta que papel/destino/persistência passam a vir do backend (JWT / `GET /api/usuarios/me`) quando o login real existir.
- **fix (closes #72):** `Perfil.jsx` usava um `navItems` fixo de "usuário individual" para todos os papéis (Perfil é a única rota sem guarda de papel), então médico/educador físico/comando viam "Meu Histórico" e "Solicitar Acompanhamento" no menu lateral, e o card de opt-out do ranking (que só se aplica a integrante) aparecia para todos. Nova `frontend/src/features/auth/navPorPapel.js` (`NAV_POR_PAPEL`, `PAPEL_PADRAO`, `navItemsDoPapel`) mapeia o menu por papel; o Perfil deriva o papel logado via `useAuthStore` (mesmo atalho de dev do Login, `features/auth/roles.js`, enquanto não há auth real) e monta o menu certo. Para papéis não-integrantes o Perfil passa a ser só e-mail + troca de senha + consentimento LGPD — as seções de medidas corporais (peso/altura/data de nascimento) e ranking ficam atrás de `ehUsuarioIndividual`. Sem usuário em memória (abrir `/perfil` direto pela URL), assume `usuario`. Os dashboards de cada papel ainda mantêm seu `navItems` local com passos de tour; a convergência para `NAV_POR_PAPEL` fica para quando o tour for desacoplado da definição do menu.
- **refactor (closes #88):** `pages/Perfil/Perfil.jsx` era uma página única e longa com tudo empilhado. Vira **"Configurações"** — o item do menu lateral (`components/DashboardLayout.jsx`) foi renomeado de "Perfil" para "Configurações" (ícone `Settings`), e a tela agora tem **seções navegáveis por abas**, com a seção ativa espelhada em `?secao=` para permitir link direto: **Editar perfil** (e-mail, data de nascimento, peso/altura — só usuário individual — + botão "Alterar senha"), **Meus dados**, **Ranking** (só usuário), **Notificações** e **Acessibilidade**. Mudanças estruturais: (1) a troca de senha, que era um card inline no Perfil (closes #28), foi **extraída para tela própria** — `pages/AlterarSenha/AlterarSenha.jsx`, rota `/perfil/alterar-senha`, alcançada pelo botão "Alterar senha" da seção "Editar perfil"; o `trocarSenhaSchema` foi junto. (2) O botão **"Baixar histórico"** foi **movido** do `DashboardUsuario` para Configurações → Meus dados (não duplicado), sob a ótica de LGPD/portabilidade — novo `components/BaixarHistoricoMenu.jsx` encapsula o dropdown CSV/PDF, o `montarDadosHistorico` e os mocks que antes viviam no `DashboardUsuario`; o passo de tour `baixar-historico` daquele dashboard foi substituído por um passo `nav-configuracoes`. (3) A seção **Notificações** é um placeholder "em breve", reservando o lugar da issue #31. (4) Consentimento LGPD e opt-out do ranking só mudaram de lugar (agora em Meus dados e Ranking), sem mudança de lógica. A rota continua sendo `/perfil` (não renomeada) — só o rótulo no menu mudou. A decisão pendente da issue #29 (tipo sanguíneo, contato de emergência) tem um comentário reservando o ponto na seção "Editar perfil".
- **feat (closes #91):** FAQ público na Landing + ícone de ajuda expandido. Novo `features/faq/perguntas.js` (`PERGUNTAS_FREQUENTES`, conteúdo alinhado às decisões já registradas — plataforma institucional, acesso segmentado, LGPD, solicitação→confirmação) e `components/FaqAccordion.jsx` (acordeão acessível: `aria-expanded`/`aria-controls`, resposta via `[hidden]`). `pages/Landing/Landing.jsx` ganha a seção `#faq` (entre "Para instituições" e o CTA final) e o link "Perguntas frequentes" na navbar. No `DashboardLayout`, o ícone de ajuda deixou de reabrir o tour direto — virou um menu (`HelpMenu`) com **"Rever tour guiado"** (chama o `onHelp` de antes) e **"Ver perguntas frequentes"** (link para `/#faq`). Os 4 dashboards não mudaram: continuam passando `onHelp={restart}`.
- **feat/a11y (closes #95):** seção "Acessibilidade" em Configurações com modo simplificado. Novo `features/acessibilidade/store.js` (Zustand + `localStorage` `rastria:acessibilidade`, mesmo padrão de `features/theme/store.js` — aplicado na importação do módulo em `main.jsx`, antes da 1ª renderização): duas preferências, `fonteGrande` (classe `.fonte-grande` no `<html>` → `font-size` base maior, todo o app escala junto por usar rem) e `modoSimplificado` (classe `.modo-simplificado` → esconde elementos `[data-decorativo]` e reforça o contraste do texto secundário). O CSS vive em `styles/index.css` **fora de `@layer`** (mesma razão dos overrides de tema escuro: prioridade sobre as utilities do Tailwind). SVGs decorativos de `Landing` (hero) e `AuthBrandPanel` receberam `data-decorativo` + `aria-hidden`. O escopo exato do "modo simplificado" ainda será refinado com a equipe (issue #95) — esta é a versão conservadora inicial.
- **fix/security (closes #65):** `frontend/src/lib/api.js` guardava o access token em `localStorage` com só um interceptor de request — quando o token expirava (1h, `SIMPLE_JWT`), toda request passava a falhar com 401 sem tentativa de recuperação, e o refresh token de 7 dias emitido pelo backend nunca era usado. (1) Novo `frontend/src/lib/authTokens.js` — ponto único de `get/set/clear` dos tokens (`rastria_access_token` + `rastria_refresh_token`), com `try/catch` em todo acesso ao `localStorage`; nenhum outro módulo toca nas chaves diretamente, então trocar o mecanismo de storage é mudança local. (2) `api.js` ganha interceptor de response: em 401, tenta **uma vez** `POST /api/auth/token/refresh/` com o refresh token e refaz a request original com o novo access; `refreshEmAndamento` colapsa vários 401 simultâneos num único POST (as demais requests aguardam a mesma promise). Se o refresh falhar (expirado/revogado/ausente), `encerrarSessao` limpa os tokens e faz `window.location.assign("/login")` (redirect "hard" porque `api.js` roda fora do React Router — também descarta o `usuario` em memória). O POST de refresh usa `axios` cru (sem os interceptors da instância) para não recursar em 401. (3) `features/auth/store.js` — `limparEstadoDoUsuario` passa a chamar `clearTokens()` (limpa access **e** refresh) em vez de remover só o access. **Decisão registrada no header de `authTokens.js`:** manter os tokens em `localStorage` por ora; migrar o refresh para cookie `httpOnly` + `Secure` depende de endpoint/CORS/CSRF no backend, que ainda não está deployado — quando existir, só `authTokens.js` e o interceptor de `api.js` mudam. Continua sem `features/*/queries.js` implementados (login ainda é mock, `POST /api/auth/token/` não é chamado); esta é a fundação para quando a API real entrar.
- **fix (closes #74):** `features/tour/useGuidedTour.js` usava uma chave de localStorage **por papel** (`rastria:tour:<papel>`), então numa demo em que o apresentador troca de papel pelo atalho de dev o tour disparava automático na primeira visita de **cada um dos 4 painéis** (4 popups). Agora é uma **chave única global** (`rastria:tour-visto`), fora do prefixo `rastria:tour:` limpo no logout — como o tema, é preferência do dispositivo ("já vi a apresentação aqui"), não do usuário. O tour automático aparece no máximo uma vez por navegador; o botão de ajuda (?) do header continua reabrindo o tour do painel atual via `restart`. Além disso, o início automático passou a ter um atraso de 400ms para o layout assentar (a sidebar é `hidden md:flex`) antes do Joyride medir e posicionar o primeiro tooltip — antes ele abria no `load` com o rect ainda zerado e o tooltip caía por cima da sidebar. `useGuidedTour()` não recebe mais argumento (os 4 dashboards foram atualizados).
- **feat (closes #90):** o "Baixar histórico" em PDF passa a incluir um **gráfico de evolução por índice ao longo do tempo**, não só a tabela de valores. `lib/exportarHistorico.js`: o formato de `dados` ganha o campo opcional `graficos: [{ titulo, unidade, pontos: [{ rotulo, valor }] }]` (só afeta o PDF); novo `desenharGraficoEvolucao(doc, grafico, area)` desenha um gráfico de linha **em vetor pelo próprio jsPDF** — linhas-guia + rótulos de eixo, série em Primary Teal, último ponto destacado em Seafoam — sem lib de chart nem backend. `gerarPdfHistorico` adiciona uma seção "Evolução" com um gráfico por índice que tenha ≥2 medições. `components/BaixarHistoricoMenu.jsx`: o mock passou de uma medição por índice para um `historicoMock` com várias medições datadas (peso, glicemia, pressão sistólica, IMC mês a mês) — `montarDadosHistorico` monta a tabela e os `graficos` a partir dele. CSV inalterado (continua tabela). `TODO` aponta para `GET /api/registros-saude` com o histórico completo.
- **feat (closes #96):** indicador de força de senha em tempo real. `lib/senha.js` ganha `CRITERIOS_SENHA` (mesmos requisitos do `senhaForteSchema`, em forma de lista) e `avaliarSenha(senha)`; novo `components/ForcaSenha.jsx` (barra de progresso + checklist dos 4 requisitos ficando verdes conforme digita). Substitui a dica estática "Mínimo 8 caracteres…" em `PrimeiroAcesso`, `RedefinirSenha` e `AlterarSenha` (as 3 telas de criação/troca de senha), com o valor do campo observado via `watch()` do react-hook-form. O `id` do componente entra no `aria-describedby` do campo. A validação de envio continua sendo o `senhaForteSchema` — o indicador é só feedback. Comentário em `senha.js` lembra que schema e critérios precisam mudar juntos.
- **feat (closes #92):** encerra a sessão automaticamente após 20 min sem interação — o app lida com dado de saúde sensível e a sessão não deveria ficar aberta indefinidamente num navegador destravado. Novo `features/auth/SessaoInativa.jsx` (montado em `routes/index.jsx`, dentro do Router e do `ToastProvider`): só age com usuário logado; um timestamp barato é atualizado a cada evento de atividade (`mousedown`, `keydown`, `scroll`, `touchstart`, `pointermove`) e um intervalo de 15s confere a inatividade. Aos 18 min, aviso ("Sua sessão vai encerrar em breve por inatividade"); aos 20, `logout()` (mesmo do store) + redirect pro `/login` + toast de erro. `TODO`: com o login real, encerrar sessão também deve invalidar o refresh token no backend.
- **feat (closes #94):** resumo rápido no topo do `DashboardUsuario` — antes era preciso ler a lista inteira para saber se estava tudo em dia. Novo `resumirSituacao(registros, taf)` deriva a situação **só do que já está carregado na tela** (registros de saúde + último TAF, sem nova chamada à API): uma pendência é um índice em "atenção"/"alterado" ou um TAF "inapto". Banner verde ("Tudo em dia") quando não há pendência; banner de atenção ("N pendência(s)" + lista dos índices a revisar) caso contrário. Usa as classes `badge-normal`/`badge-atencao` do design system.
- **fix (closes #76):** `pages/RankingFisico/RankingFisico.jsx` — o filtro "Meu batalhão" agrupava por `batalhaoPorPessoa` (id → "1º Batalhão"), mas cada linha exibia `entrada.unidade` como "Nª Companhia" solta, sem reconciliação visual entre os dois. Consolidado num único mapa `pessoas` (id → `{ nome, batalhao, companhia }`) como fonte de verdade; `rankingsPorAtividade` passa a carregar só `id` + `tempo`, e o `useMemo` enriquece cada entrada com os dados de `pessoas`. As linhas agora mostram "1º Batalhão · 2ª Companhia", e quando o escopo "Meu batalhão" está ativo aparece um aviso "Mostrando só integrantes do 1º Batalhão". Elimina a duplicação que deixava o mock divergente.
- **fix (closes #45, #75):** `pages/SolicitarAcompanhamento/SolicitarAcompanhamento.jsx`. (#45) Depois de "Solicitar", a lista de profissionais era substituída pelo card "Aguardando confirmação" sem nenhuma saída — só recarregando a página. Adicionado botão "Cancelar solicitação" no card de pendência, que volta para a lista (`showToast("Solicitação cancelada")`). (#75) `vinculoAtivo` era inicializado como `null` e nunca mudava, então o bloco "Seu acompanhamento contínuo" (que ilustra solicitação → confirmação → continuidade de cuidado, o que diferencia o modelo do matching instantâneo) nunca aparecia. Agora, ao enviar a solicitação, um timer de ~4s simula a confirmação do profissional: limpa a pendência, seta `vinculoAtivo` e mostra `showToast("… confirmou seu acompanhamento")` — o bloco de vínculo contínuo passa a aparecer, com "Nova solicitação" e um link "Encerrar acompanhamento" para repetir o fluxo na demo. O timer é limpo ao cancelar ou desmontar a tela. `TODO` aponta para `POST /api/atendimentos/solicitar` + `GET /api/vinculos-cuidado/meu`.
- **fix (closes #73):** os botões "Confirmar"/"Recusar" de "Solicitações pendentes" em `DashboardMedico` e `DashboardEducadorFisico` não tinham `onClick` — clicar na frente do cliente não fazia nada, enquanto outras ações do mock já simulam funcionamento (CSV, cadastro de TAF, `CadastroInformacoes`). Agora a lista de solicitações e a de "Meus pacientes"/"Meus alunos" são estado local: confirmar remove a solicitação de forma otimista, adiciona a pessoa a "Meus pacientes"/"Meus alunos" (se ainda não estiver) e mostra `showToast("Solicitação confirmada")`; recusar remove a solicitação com `showToast("Solicitação recusada")`. Muda com o reload (sem endpoint) — `TODO` aponta para `PATCH /api/solicitacoes/:id` + refetch. Coerente com "supor que funciona" da fase de mock.
- **chore (closes #78):** removidos `frontend/src/components/Button.jsx` e `components/Card.jsx` — não eram importados em lugar nenhum. As telas usam as classes `.btn-primary`/`.btn-outline` e markup de card inline (`rounded-xl bg-white p-4 shadow-sm`), padrão do design system em `styles/index.css`; adotar os dois componentes exigiria refatorar ~15 telas sem ganho na fase de mock. Se a padronização de botão/card virar prioridade, recriar a partir do uso real das classes.

**31/08/2026**
- **fix/security (closes #106):** `frontend/` sobe de `vite@5.4.21` → `vite@8.2.2` e `@vitejs/plugin-react@4.3.2` → `@6.1.1`, zerando as 3 vulnerabilidades de build do `npm audit` (GHSA-fx2h-pf6j-xcff — bypass de `server.fs.deny` no Windows, alta/CVSS 7.5; GHSA-4w7w-66w2-5vf9 — path traversal em `.map`; GHSA-v6wh-96g9-6wx3 — hash NTLMv2 via UNC; e a transitiva `esbuild` GHSA-67mh-4wv8-2f99 — dev server aberto a qualquer origem). Todas restritas ao dev server (não afetam o bundle de produção). `npm run build` validado com a major nova (Vite 8 usa Rolldown; build ok, só o aviso pré-existente de chunk > 500 kB). Defesa em profundidade no `vite.config.js`: `server.host` fixado em `127.0.0.1` (dev server não é mais exposto na rede local). Fica de fora do escopo desta issue a vuln moderada de `react-router` (GHSA-wrjc-x8rr-h8h6 / GHSA-337j-9hxr-rhxg) — é dependência de runtime, tratada como item MÉDIO-9 da auditoria, separado.
- **fix/security (closes #107):** `react-router-dom` sobe de `^6.26.2` → `^7.18.3` (major), zerando as 2 vulnerabilidades moderadas de runtime do `npm audit` (GHSA-wrjc-x8rr-h8h6 — open redirect via barra invertida em `<Link>`/`useNavigate`, bypass do CVE-2025-68470; GHSA-337j-9hxr-rhxg — injeção de construtor via `deserializeErrors()` na hidratação SSR, não aplicável ao app, que é SPA sem SSR). `npm audit` agora reporta **0 vulnerabilidades**. Migração sem mudança de código: o app usa só a API declarativa (`BrowserRouter` + `<Routes>`/`<Route>`, `Link`, `Navigate`, `Outlet`, `useNavigate`/`useLocation`/`useParams`/`useSearchParams`), toda re-exportada por `react-router-dom` na v7; nenhum data router, `defer`, `json` ou flag `future` em uso. `npm run build` validado. Defesa em profundidade contra o open redirect: novo `frontend/src/lib/rotaInterna.js` (`rotaInternaSegura(caminho, fallback)`) — só aceita caminho absoluto do próprio app, joga `//evil.com`, `/\evil.com`, `https://evil.com` e afins no fallback. `features/auth/RotaProtegida.jsx` passa a sanitizar o `location.state.from` que guarda antes de mandar pro `/login`; o `TODO` do redirect pós-login em `pages/Login/Login.jsx` foi atualizado para lembrar de sanitizar o `from` de novo ao consumi-lo (o redirect em si continua não implementado — login ainda é mock).
- **fix/security (closes #111):** o frontend era servido por `serve -s frontend/dist` sem nenhum header de segurança (sem CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). Sem trocar o `serve`, agora existe `frontend/public/serve.json` — o Vite copia para `dist/` no build e o `serve` (v14, valida o arquivo contra `@zeit/schemas`) passa a injetar em **toda** resposta (rota SPA, deep link e asset — verificado localmente com `curl`): `Content-Security-Policy` (`default-src 'self'`; `frame-ancestors 'none'`; `base-uri 'self'`; `object-src 'none'`; `form-action 'self'`; `style-src` + `'unsafe-inline'` e `https://fonts.googleapis.com` por causa dos estilos inline do React/react-joyride e do Google Fonts; `font-src` `https://fonts.gstatic.com`; `img-src` `'self' data: blob:`; `script-src 'self'` — o build do Vite não emite script inline, confirmado no `dist/index.html`; `connect-src 'self' https://*.railway.app`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` mínimo (câmera/mic/geo/USB/etc. desligados) e `Strict-Transport-Security`. Reforço pedido na issue: CSP também como `<meta http-equiv>` no `index.html`, injetada por um plugin novo do `vite.config.js` (`rastria-csp-meta-tag`, `apply: "build"` — não roda no dev server, senão bloquearia o script inline do React Refresh; `frame-ancestors` fica de fora da meta porque o navegador só honra essa diretiva via header). `npm run build` + `npm run dev` validados. **Pendências:** (1) `connect-src` está em `https://*.railway.app` porque a URL real da API ainda não existe (login é mock, nenhum `queries.js` implementado) — fixar na origem exata quando o backend for deployado; (2) `serve.json` fica acessível em `GET /serve.json` (limitação do `serve`, sem diretiva de "deny") — conteúdo não é sensível (são os mesmos headers já visíveis na resposta); (3) a issue sugere idealmente um proxy/edge na frente — isto resolve o essencial sem essa mudança de infra.
- **fix/deploy:** o deploy no Railway quebrou depois dos merges de #106/#107/#111 — o Nixpacks, sem versão de Node fixada, provisiona o Node default dele (18 / 20.x < 20.19), incompatível com o Vite 8 + `@vitejs/plugin-react` 6 + rolldown, que exigem `^20.19.0 || >=22.12.0`. `vite build` passava local (Node 24) e estourava no Railway. Correção: `.nvmrc` (`22`) na raiz + `engines.node >=22.12.0` em `package.json` (raiz) e `frontend/package.json` — o Nixpacks lê qualquer um e passa a usar Node 22.
- **feat (closes #79):** central de atendimentos concluídos — finaliza a implementação de `2a58e8b` (que já tinha criado as duas telas mas nunca foi ligada à issue). `components/AtendimentosRealizados.jsx` (médico/educador, escopo `clinico`/`fisico`): cada linha do log agora linka para o detalhe do integrante (`detalheBase` + `pessoaId`), e o texto de apoio deixa explícito que é o log do que já foi atendido, distinto de "Meus pacientes"/"Meus alunos" (responsabilidade atual, no painel). `pages/HistoricoAtendimentos/HistoricoAtendimentos.jsx` (usuário): copy de apoio passa a citar que complementa o histórico de exames de "Meu Histórico". `routes/index.jsx`: import de `HistoricoAtendimentos` separado da linha do `RedefinirSenha` (estavam grudados). Dado ainda mock — `TODO` aponta para `GET /api/atendimentos`. `npm run build` validado.

**01/09/2026** — lote de issues de frontend fechadas em sequência, preparando o terreno para o backend.
- **chore (closes #77):** `Onboarding`/`EsqueciSenha` já estavam resolvidas por trabalho anterior; issue fechada após verificação, sem mudança de código.
- **feat (closes #29):** tipo sanguíneo e contato de emergência em Configurações → Editar perfil, resolvendo a decisão que estava pendente desde a #88 (Perfil, não Onboarding — não são dados necessários no primeiro login). Novo `lib/dadosComplementares.js` com `TIPOS_SANGUINEOS` e os schemas. Contato de emergência é validado em par (nome e telefone juntos ou nenhum dos dois) por um `superRefine`, não por `.refine()` no objeto — `.refine()` devolve `ZodEffects`, que não expõe `.shape` para os campos individuais.
- **feat (closes #80):** estados vazios com CTA nas telas que ainda não tinham, e `components/DemoToggle.jsx` para tornar o estado vazio demonstrável (as listas mockadas nunca ficam vazias sozinhas).
- **feat (closes #97):** confirmação explícita ao abrir um resultado "Alterado" — um badge na lista não garante que a pessoa notou a gravidade. O modal exige "Entendi" antes de poder ser fechado; só depois vira fechável livremente.
- **feat (closes #93):** formulário "Reportar problema" no menu lateral dos 4 painéis.
- **feat (closes #89):** log de acesso ao próprio prontuário em Configurações → Meus dados (quem viu, quando) — transparência exigida pela LGPD.
- **feat (closes #52):** "Fale com o time" da Landing deixa de ser link morto e vira formulário real.
- **chore (closes #81):** consentimento LGPD — verificada a sobreposição com a #18; o que faltava já estava coberto.
- **feat (closes #99):** anexar PDF/JPG/PNG a exames, com "Visualizar"/"Baixar" no card. Protótipo com blob local, sem upload real. Cuidado de marcação: o card do registro só podia virar `<button>` quando não havia anexo, porque os links do anexo também são interativos e `<a>` dentro de `<button>` é HTML inválido.
- **feat (closes #117):** painel de notificações (dropdown do sino) no cabeçalho, por papel. Interface apenas — geração real de evento depende da #31.
- **feat (closes #98):** tela de configuração da hierarquia de unidades pelo Gerente (`features/hierarquia/store.js`), tirando do código a estrutura de batalhões/companhias que era fixa.
- **feat (closes #17):** upload de planilha de integrantes com prévia antes de importar. **Decisão de segurança:** o pacote `xlsx` do npm tem 2 vulnerabilidades de severidade alta sem correção disponível, então não entrou no projeto — foi escrito um parser de CSV próprio (`lib/parseCsv.js`). O seletor aceita `.xlsx` mas orienta exportar como `.csv`. Se planilha binária virar requisito, a conversa recomeça pela segurança da dependência, não pela conveniência.
- **fix:** ícones do cabeçalho (tema, notificações, ajuda) desalinhados entre si, e dropdowns cortados no topo — resolvidos com wrapper `relative inline-flex items-center` e ancoragem abaixo do botão.

**02/09/2026**
- **feat (closes #119, #120):** criada a camada de dados mock — `lib/mockQuery.js` (`useMockQuery`/`useMockMutation`, que resolvem mocks passando pelo ciclo real do `useQuery`), `features/<área>/queries.js` e os componentes `Skeleton`/`EstadoErro`. A ideia é que a troca para a API real fique isolada no `queries.js` e nenhuma tela mude.

**18/09/2026** — segunda auditoria do projeto, duas semanas depois. O achado principal foi que a infraestrutura de 02/09 tinha sido criada mas nunca ligada a nenhuma tela.
- **fix (closes #126):** a classe `.skeleton` de que `components/Skeleton.jsx` depende nunca tinha sido escrita em `styles/index.css` — sem cor de fundo, o placeholder renderizava transparente, ou seja, a tela ficava em branco durante o carregamento, exatamente o que a #120 queria evitar. Regra adicionada junto dos overrides de tema (fora de `@layer`, vale nos dois temas), com a pulsação desligada sob `prefers-reduced-motion`.
- **refactor (closes #125):** nenhuma tela importava `mockQuery`, os `queries.js` ou `Skeleton`/`EstadoErro` — era código morto, e os mocks ficaram duplicados entre `queries.js` e as telas. A duplicação já tinha divergido: no ranking, `Sd. Rocha` aparecia em companhias diferentes em cada cópia, e a cópia de `queries.js` ainda usava o formato de dado que a #76 tinha abandonado. Migradas `DashboardGerente`, `TelaPorUnidade`, `RankingFisico`, `DetalhePaciente`, `DetalheAluno` e `CadastroTAF`. **Divisão de responsabilidade estabelecida aqui:** a ESTRUTURA da hierarquia (quais unidades existem) fica no store editável pelo Gerente (#98) e o INDICADOR agregado ("% em dia") vem da camada de dados, indexado por id; a tela cruza os dois. É a divisão que o comentário do próprio store já pedia — a instituição define a própria estrutura, só o backend calcula o indicador por cima dela. Unidade sem número é unidade sem dado real ainda.
- **feat (closes #127):** `features/saude/queries.js` e `features/atendimentos/queries.js` eram stubs de 2 linhas — os dois maiores domínios do produto sem camada de dados. Preenchidos (registros, TAF, solicitações, vínculos de cuidado, log de atendimentos, profissionais) e 7 telas migradas. Confirmar/recusar solicitação (#73) deixou de ser `useState` local e virou mutation, com a atualização das listas **dentro do hook**, que é quem conhece as query keys — quando o endpoint existir, as escritas em cache viram `invalidateQueries` e nenhuma tela muda. Campos unificados: `paciente`/`usuario` → `pessoa`, `ultimoExame`/`ultimaAvaliacao` → `ultimoContato`.
- **chore/security (closes #128):** o atalho "entrar direto como..." do Login e o `DemoToggle` iam para produção. Ambos ficam atrás de `VITE_MODO_DEMO` (`features/demo/flag.js`; ausente = ligado só em dev). **Esconder o botão não bastava:** o papel fica persistido em `rastria:usuario` no `localStorage` e o store reidrata a sessão a partir dele, então bastaria escrever essa chave à mão para entrar como qualquer papel. A reidratação também passou a exigir a flag. A flag reduz a exposição, **não substitui** a remoção do atalho quando o login real existir — e guarda de rota no cliente nunca é a proteção de verdade (isso é #103/#59, no backend).
- **feat (closes #129):** notificações deixam de ser texto morto e levam à tela de origem. Quando o alvo é uma seção, usa fragmento (`/gerente#exames-atrasados`) e um hook no `DashboardLayout` rola até ela, ancorando no `data-tour` que as seções já carregam. O corpo vira `<Link>`, com o botão de excluir como **irmão** — nunca aninhado, o mesmo HTML inválido que a #99 teve de contornar. Destino passa por `rotaInternaSegura`, porque com a #31 esse campo passa a ser dado externo.
- **feat (closes #130):** editar e excluir registros de saúde. Registros ganharam `origem`: o usuário mexe no que ele mesmo lançou, mas não no exame do médico nem no TAF do educador físico. Editar o valor derruba a confirmação de leitura do "Alterado" (#97) — o que a pessoa confirmou ter visto foi o valor antigo. Efeito colateral bom: com ações por registro, o card não pode mais virar `<button>`, e a condicional frágil herdada da #99 deu lugar a uma linha de ações uniforme. Descoberto no caminho que **nenhum registro mockado tinha status "alterado"**, então o fluxo inteiro da #97 nunca aparecia na tela — acrescentado um. **DECISÃO PARA O BACKEND:** exclusão de registro de saúde deve ser *soft delete* com trilha (quem excluiu, quando), nunca `DELETE` físico — é prontuário, e o log de acesso da #89 só faz sentido assim. Conversa com a #67.
- **docs (closes #131):** este changelog estava parado em 31/08, sem as 13 entregas seguintes.

**23/09/2026** — auditoria de acessibilidade (WCAG 2.2 AA + eMAG 3.1): 18 issues abertas (#134–#151), rastreadas na #152. Decisões: preferências de acessibilidade só na aba Configurações › Acessibilidade; sem VLibras; sessão de 30 min com pop-up para renovar (#143).
- **feat (closes #134):** link "Pular para o conteúdo" como primeiro foco de toda tela (renderizado uma vez em `routes/index.jsx`, não por página), `<main id="conteudo">` em todas as rotas via `ConteudoPrincipal` (Landing, telas de acesso, 404 e termo de consentimento não tinham nenhum), `aria-label` nas `<nav>` e o painel de marca das telas de acesso virou `<aside>`. Atalhos do eMAG Alt+1 (conteúdo) e Alt+2 (navegação) em `features/acessibilidade/AtalhosTeclado.jsx`, desligáveis na aba — Alt+número troca de aba em alguns navegadores no Linux. A navegação é marcada com `data-navegacao-principal`, não `id`, porque a sidebar existe duas vezes no DOM (fixa e gaveta); com a gaveta fechada no celular, Alt+2 cai no botão "Abrir menu". O skip link move o foco em vez de seguir `#conteudo`, senão o fragmento iria para a URL e o `useRolarParaSecao` da #129 o trataria como seção.
- **feat (closes #149):** aba Configurações › Acessibilidade reorganizada em grupos (Exibição, Movimento, Navegação por teclado) e store virou tabela `PREFERENCIAS` — preferência nova é uma entrada (`padrao`, `classe`, `mediaQuery` opcional), não um `toggleX` novo. **Só as escolhas explícitas vão para o `localStorage`:** chave ausente = segue o padrão, o que permite o padrão vir do sistema operacional (`prefers-reduced-motion` hoje; `prefers-contrast` quando a #137 entrar) e acompanhar mudanças nele com o app aberto, e faz de "Restaurar padrões" apenas apagar a chave. O formato antigo continua lido. Entraram "Espaçamento de texto ampliado" (valores exatos do WCAG 1.4.12) e "Reduzir movimento" (regra global por classe, não por media query, para que desligar no app vença o sistema; o `.skeleton` e a rolagem da #129 passaram a obedecer ela — Joyride e o toggle do tour seguem na #145). Os toggles viraram `role="switch"` com o estado também em texto ("Ativado/Desativado"), valendo para todo `ToggleLinha`.
- **feat (closes #136):** indicador de foco próprio em `styles/index.css` (`:focus-visible`, 3px, contraste ≥ 3:1 com o fundo ao redor em todo Tab testado): verde no claro, `dark-primary` no escuro e **branco dentro de áreas `bg-primary`** — o anel padrão do navegador sumia na sidebar. Em contêineres com `overflow` o anel é desenhado para dentro (`outline-offset` negativo), senão o recorte o comia. Seletores de arquivo (`input` `sr-only` + `<label>` estilizado) ganharam a regra `input[type=file]:focus-visible + label` — **o `<label>` visível precisa vir logo depois do input**; no modal de exame estava antes e foi invertido. O "Excluir" das notificações aparece ao focar e em telas sem hover. Nova preferência "Destaque de foco reforçado" (anel preto + halo amarelo) no grupo Navegação por teclado.
- **feat (closes #137):** contraste AA em todo o app — axe `color-contrast` zerado em 21 rotas, nos temas claro e escuro e com "Alto contraste". Coral e Seafoam como texto passaram para variantes escuras (`coral-escuro`/`seafoam-escuro`, ver Identidade de Marca); no escuro as originais voltam. Bordas de campo com cor própria (`borda-campo`, 3,5:1) sem tocar em tela: `input.border-line` vence a utility. Placeholder, badges de atenção/alterado (4,49:1 → 5,2:1), pódio do ranking e `text-[10/11px]` → `text-xs` também. Um `opacity-80` sobre o badge do resumo do dashboard derrubava o texto para 3,5:1 — **opacidade sobre texto já no limite é o jeito mais fácil de voltar a reprovar**. Nova preferência **"Alto contraste"** (segue `prefers-contrast: more`, AAA 7:1 no texto secundário, bordas fortes, links sublinhados); o reforço de contraste que estava no "Modo simplificado" (#95) mudou para ela.
- **feat (closes #135):** título da aba por tela via `useTituloPagina(...partes)` (`lib/tituloPagina.js`), do mais específico ao mais geral + "Rastria" — as 30 rotas têm título único. **Telas que dividem o mesmo `title` de painel passam `paginaAtual` ao `DashboardLayout`** ("Bruno Alves · Painel do Médico · Rastria"); tela nova de painel que repetir um título existente precisa fazer o mesmo. A troca de `pathname` (não de hash nem de query) passa por `features/acessibilidade/AnuncioDeRota.jsx`: foca o `<h1>` visível da página nova ou, com a preferência "Levar o foco ao título" desligada (grupo novo **Leitor de tela**) ou sem `<h1>` visível, anuncia o título numa região `aria-live` que existe desde a carga. A detecção de navegação compara com o `pathname` anterior — uma flag de "primeira carga" quebrava com o StrictMode, que roda o efeito duas vezes.
- **feat (closes #141):** `CampoBusca` exige `rotulo` (vira `<label>` oculto, `type="search"`, região `role="search"`) — o axe aceita placeholder como nome e não acusava, mas placeholder some ao digitar (WCAG 3.3.2). **Ação repetida em lista leva o contexto no nome acessível**, com o texto visível no início (WCAG 2.5.3): "Editar — Glicemia de 14 ago 2026", "Confirmar solicitação de Fulano", "Excluir 1ª Companhia (1º Batalhão)" — nome de companhia se repete entre batalhões, só o nome dela não bastava. Dado só de leitura no Perfil virou `<dl>` (era `<label>` sem campo); contato de emergência e provas do TAF viraram `<fieldset>`/`<legend>`.
- **feat (closes #139):** Ajuda, Notificações e Baixar histórico deixam de ser `role="menu"` (que promete navegação por setas nunca implementada; o de notificações ainda misturava lista, links e botões) e viram **Disclosure** via `lib/usePainelSuspenso.js`: `aria-expanded`/`aria-controls`, Esc fecha e devolve o foco, Tab para fora e toque/clique fora fecham. **Painel suspenso novo usa esse hook, não `role="menu"`.** Ação que some da tela depois de usada (excluir notificação, marcar todas, limpar, opção de download) leva o foco a um lugar definido em vez de deixá-lo cair no `<body>`. Elemento com `tabindex="-1"` (destino de foco por script) não recebe anel — regra geral em `styles/index.css`.
- **feat (closes #140):** gavetas de menu do celular (painel e Landing) viram diálogo modal via `components/Gaveta.jsx`: foco preso, Esc, foco volta ao "Abrir menu", scroll do fundo travado, `aria-expanded`/`aria-controls` no botão. O comportamento saiu do `Modal` para `lib/useFocoPreso.js`, compartilhado pelos dois — **diálogo ou gaveta nova usa esse hook, não reimplementa foco preso**. O fundo escuro deixou de ser um segundo botão "Fechar menu" do tamanho da tela. Ao abrir, o foco vai para o 1º link da navegação; se a janela passa do `md` com a gaveta aberta, ela fecha (senão o foco ficaria preso num painel escondido). A devolução de foco usa `preventScroll`, para âncora da Landing não perder a rolagem.
- **feat (closes #142):** avisos (toasts) com regiões `aria-live` que existem desde a carga — `role="status"` para sucesso e `role="alert"` para erro; região criada junto com o texto costuma não ser lida. Sucesso some após a duração escolhida em Configurações › Acessibilidade (5/10/20 s ou "até eu fechar", padrão 5); **erro fica até fechar**; ponteiro ou foco sobre o aviso pausa o tempo; botão "Fechar aviso", com o foco indo para o próximo aviso ou para o conteúdo. Primeira preferência de múltipla escolha: `PREFERENCIAS` aceita `opcoes` e o store ganhou `definir`. **`showToast(msg, "erro")` em toda falha** — quatro `onError` mostravam o erro como sucesso. `CampoBusca` com `totalResultados` anuncia "N resultados" 0,5 s depois da última tecla.
- **feat (closes #143):** sessão encerra após **30 min** sem atividade (decisão do time de 23/09; eram 20), com pop-up `alertdialog` aos 28 min — "Renovar sessão" (foco inicial) ou "Sair agora", e o tempo restante no texto, atualizado a cada 15 s. **Com o pop-up aberto, atividade fora dele não renova**: a renovação é explícita (botão, Esc ou clique no fundo). Ao expirar, o Login mostra uma mensagem fixa (`role="alert"`) com o motivo, e a aba Acessibilidade explica o limite. **O motivo vai por `sessionStorage`, não pelo `state` da navegação:** o React Router v7 navega como transition e o store de auth atualiza na hora, então a `RotaProtegida` da tela atual redirecionava antes com o próprio `state` — o mesmo vale para qualquer dado que precise sobreviver a um logout seguido de navegação. `Modal` ganhou `papel`, `descricaoId` e `seletorFocoInicial`.
- **feat (closes #144):** todo alvo interativo passa no WCAG 2.5.8 (24 px, com a exceção de espaçamento) em 15 rotas, a 390 e 1280 px — ícones do cabeçalho viraram botões de 36 px, e olho da senha, excluir notificação, ações da hierarquia e dos registros ganharam área de toque sem mudar o desenho. **Botão só de ícone: área mínima `h-8 w-8`/`h-9 w-9`, não o tamanho do ícone.** Nova preferência "Botões e áreas de toque maiores" (44 × 44, AAA 2.5.5) via `min-height`/`min-width` — não afeta link dentro de frase. Descoberto no caminho: em 320 px (zoom de 400%) cinco telas já rolavam na horizontal, independentemente disto — issue própria de reflow, #161 (WCAG 1.4.10).

- **feat (closes #161):** nenhuma rota rola na horizontal a 320 px (zoom de 400%, WCAG 1.4.10) — nem com "Fonte grande", "Espaçamento de texto" e "Botões maiores" ligados juntos; antes eram 6 rotas no modo normal, 13 com fonte grande e 16 com fonte + espaçamento. Causa única: a coluna de conteúdo do `DashboardLayout` era item flex `flex-1` sem `min-w-0` — item flex não encolhe abaixo da largura mínima do próprio conteúdo, então qualquer filho largo esticava a página inteira. O cabeçalho do painel agora quebra linha (`flex-wrap`, título com `break-words`) e o rótulo dos toggles da aba Acessibilidade também. **Coluna flex que contém conteúdo livre leva `min-w-0`; tabela ou bloco largo rola dentro do próprio contêiner (`overflow-x-auto`), nunca a página.**
