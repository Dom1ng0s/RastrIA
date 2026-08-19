# Rastria — Guia do Projeto

## Visão Geral
Rastria é uma plataforma digital que centraliza o histórico de saúde e desempenho físico do usuário, verifica automaticamente os índices cadastrados contra tabelas de referência clínica, e conecta o usuário a uma rede pré-qualificada de médicos e educadores físicos. Além do uso individual (B2C), opera como plataforma institucional (B2B/B2G) para empresas, academias e corporações que precisam acompanhar a saúde ocupacional de seus integrantes — piloto em andamento: **Polícia Militar de Alagoas**.

- MVP em produção: rastria.up.railway.app
- Repositório: github.com/Dom1ng0s/RastrIA
- Projeto aprovado na Fase 1 do Programa Centelha 3 — Alagoas (FAPEAL/SECTI-AL/SEBRAE-AL); resultado da avaliação previsto para 29/09/2026. O desenvolvimento segue independente desse resultado.

**Problema:** o acompanhamento de saúde no Brasil é fragmentado entre clínicas, laboratórios e academias, sem histórico centralizado. Em paralelo, empresas e forças policiais são legalmente obrigadas a acompanhar a saúde ocupacional de seus integrantes (NR-7/PCMSO), mas hoje o fazem de forma manual.

**Solução, em três pilares:** Cadastro (exames, avaliações, desempenho físico) → Verificação automática (índices comparados a tabelas de referência clínica) → Conexão (solicitação de acompanhamento a profissionais de uma rede pré-qualificada).

## Estado Atual do Repositório
**Importante:** hoje este repositório contém apenas uma landing page estática ([index.html](../index.html)) publicada no Railway via `serve` ([package.json](../package.json), [railway.json](../railway.json)). O backend Django e o frontend React descritos abaixo são a arquitetura-alvo — **ainda não foram scaffolded neste repositório**. Antes de assumir que existe um projeto Django ou uma app Vite, confira a árvore de diretórios atual.

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
│       │   ├── DashboardGerente/
│       │   ├── DashboardMedico/
│       │   └── DashboardIntegrante/
│       ├── features/             # feature-sliced: hooks de TanStack Query, stores Zustand, forms
│       │   ├── auth/
│       │   ├── saude/
│       │   └── atendimentos/
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

A landing page estática atual na raiz (`index.html` + `package.json` rodando `serve`) é o placeholder pré-scaffold. Um dos primeiros passos ao criar essa estrutura é mover `index.html` para dentro de `frontend/` e configurar `railway.json` de cada serviço separadamente (backend e frontend como serviços distintos no mesmo projeto Railway).

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
| Médico | Dados dos pacientes que atende | Membro da rede pré-qualificada, atende solicitações |
| Educador físico | Dados de desempenho físico dos usuários que atende | Membro da rede pré-qualificada, escopo restrito a atividade física (não é escopo médico) |
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

## Fluxos Principais
1. **Cadastro e verificação** — usuário cadastra exame/índice → sistema verifica contra tabela de referência → resultado exibido (normal/atenção/alterado).
2. **Solicitação de acompanhamento** — usuário solicita → sistema notifica profissionais da rede disponíveis na especialidade → profissional confirma (**não** é aceite instantâneo tipo "corrida") → atendimento registrado no histórico.
3. **Modelo institucional** — integrante cadastra dados → médico-do-trabalho analisa dado individual → gerente/comando vê apenas painel agregado.

## Regras de Design que Não Devem Ser Quebradas
- **Segregação de acesso por papel** é a garantia central vendida ao cliente institucional — nunca expor endpoint que dê a um papel de comando/gerência acesso a dado clínico individual nominal, mesmo que pareça conveniente para uma feature.
- **Conexão com profissionais é solicitação → confirmação, não matching instantâneo.** Essa escolha é deliberada: evita o enquadramento do Parecer CFM nº 15/2026 como "ambiente médico virtual" pleno (que exigiria diretor técnico/clínico formal). Não implementar aceite automático/instantâneo sem entender essa implicação regulatória.
- **Tabela de regras da verificação automática deve ser versionada no banco, não hardcoded** — permite correção rápida se uma faixa de referência clínica estiver incorreta, sem precisar de deploy.
- **Dado de saúde é dado sensível sob a LGPD** (Lei nº 13.709/2018) — exigir consentimento explícito e específico por finalidade; nunca reaproveitar um consentimento genérico de cadastro para autorizar compartilhamento de dado clínico.
- **Educador físico tem escopo segregado do escopo médico** (CONFEF/CREF) — não deve ter acesso a dado clínico fora de desempenho físico.

## Compliance (referência rápida)
- **LGPD** — dado de saúde é dado sensível; consentimento específico, acesso individual restrito ao profissional responsável.
- **NR-7/PCMSO** — o modelo institucional (gerente vê agregado, médico-do-trabalho vê individual) digitaliza uma obrigação legal já existente.
- **CFM Parecer nº 15/2026** — plataformas que intermediam atos médicos com matching instantâneo são tratadas como "ambiente médico virtual" (exige diretor técnico/clínico); o modelo de rede pré-qualificada com continuidade de cuidado evita esse enquadramento pleno.
- **CONFEF/CREF** — profissionais precisam de registro verificado; escopo do educador físico é segregado do escopo médico.

## Escopo do MVP (fatias mínimas por pilar)
| Pilar | MVP | Depois |
|---|---|---|
| Cadastro & Histórico | Cadastro manual estruturado por tipo de exame/índice; timeline visual | Upload de PDF/foto com OCR; compartilhamento seletivo granular |
| Verificação Automática | Tabela de regras fixas (faixa min/max por tipo de exame); indicador normal/atenção/alterado | Análise de tendência ao longo do tempo (Mann-Kendall); alertas automáticos |
| Conexão com Profissionais | Cadastro de profissionais com CRM/CREF verificado manualmente; solicitação → listagem de compatíveis → confirmação; contato efetivo fora da plataforma (WhatsApp/email) | Verificação automática de registro profissional; chat/vídeo embutido |
| Institucional (B2B/B2G) | Cadastro em lote de integrantes (import CSV); painel de comando com agregado por unidade | Estrutura de diretor técnico/clínico; atendimento pleno |

## Deploy
Railway, builder Nixpacks ([railway.json](../railway.json)), `startCommand: npm start` — hoje serve a landing page estática via `serve -s . -l $PORT`. Porta configurada via variável de ambiente `PORT` ([.env.example](../.env.example)).

## Modelo de Negócio (contexto, não afeta arquitetura diretamente)
- Assinatura individual (B2C) — histórico ilimitado, alertas, compartilhamento.
- Licença institucional (B2B/B2G) — cobrança por integrante ativo.
- Comissão por atendimento (marketplace) — % sobre consultas realizadas pela rede.

## Identidade de Marca
Fonte: Manual de Marca v1.0 (2026) — arquivo original ainda não versionado em `docs/brand/`, ver seção "Documentação adicional".

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

**Tipografia** — serifada forte para títulos, sans-serif limpa para corpo (ambas fontes padrão do Office, sem precisar embutir):

| Uso | Fonte | Tamanho |
|---|---|---|
| Título de slide/seção | Cambria Bold | 32–44pt |
| Subtítulo/kicker | Calibri Bold | 12–13pt |
| Corpo de texto | Calibri Regular | 12–16pt |
| Legendas/notas | Calibri Regular | 9–11pt |

No frontend web, `pt`/`px` viram a base para uma escala responsiva equivalente em `rem`/Tailwind — não usar os tamanhos em pt literalmente no CSS.

**Regras de aplicação:**
- Faça: versão primária sobre fundo claro; versão reversa sobre Primary Teal/preto; respeitar o espaço de proteção; manter Primary Teal dominante; usar Coral com moderação.
- Evite: distorcer/inclinar/esticar a logo; alterar as cores do símbolo ou da wordmark; usar a versão primária sobre fundo escuro; sombras/contornos/efeitos 3D; usar Coral e Seafoam com o mesmo peso visual.

`frontend/tailwind.config.js` já mapeia `primary`/`seafoam`/`coral` e `font-heading`/`font-body` para esses tokens — ao adicionar UI nova, usar essas classes em vez de hardcodar hex ou fontes.

## Documentação adicional
A proposta original do projeto referencia `docs/diagrams/` (diagramas UML) e `docs/brand/Rastria_Manual_de_Marca.pdf` — **esses caminhos ainda não existem neste repositório** (as pastas `docs/brand/`, `docs/pitch/` e `docs/diagrams/` já foram criadas como placeholders, mas os arquivos em si — manual de marca, diagramas UML, pitch deck — ainda não foram commitados). Se forem adicionados futuramente, atualizar este arquivo com os links corretos. A estratégia de estrutura/branches acima já foi incorporada neste arquivo, não é necessário um `docs/ESTRUTURA_REPOSITORIO.md` separado.
