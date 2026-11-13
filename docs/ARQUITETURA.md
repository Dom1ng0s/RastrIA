# Arquitetura do Rastria

Registro de decisão de 12/11/2026. Descreve a arquitetura que o código já segue, as regras que passam a ser verificadas no CI e as convenções para o código novo.

## Decisão

O Rastria é um sistema **cliente-servidor**: uma SPA em React que consome uma API REST em Django. O backend é um **monólito modular em camadas**, com um app por área do domínio. Mantemos esse desenho e formalizamos as fronteiras, em vez de migrar para arquitetura hexagonal ou microsserviços: o time é pequeno, o backend é novo e o que o produto precisa garantir é que a regra de acesso por papel fique em um lugar revisável.

## Backend

### Dependência entre apps

```
atendimentos
saude   profissionais      (mesmo nível: não se importam entre si)
instituicoes
usuarios
core
```

Um app só importa de apps abaixo dele. `core` não conhece o domínio (timestamps, paginação, monitoramento). Regra de acesso compartilhada mora em `apps/usuarios/permissions.py`, não em `core`.

### Camadas dentro de cada app

| Módulo | Responsabilidade | Não faz |
|---|---|---|
| `urls.py` | Rotas | — |
| `views.py` | Recebe a requisição, escolhe permissão, chama selector ou service, devolve resposta | Regra de negócio; consulta que decide o que o usuário pode ver |
| `serializers.py` | Valida entrada e formata saída | Definir campos que o servidor decide (papel, dono do registro) |
| `services.py` | Escritas e casos de uso: confirmar solicitação, importar planilha, verificar exame | Conhecer `request` ou HTTP |
| `selectors.py` | Leituras já filtradas por papel e instituição: "o que este usuário pode ver" | Escrever no banco |
| `models.py` | Dados e invariantes do próprio registro | Importar qualquer módulo acima |

Cada módulo só importa dos que estão abaixo dele na tabela.

`services.py` e `selectors.py` **ainda não existem**: nascem junto com as issues que trazem regra de negócio, não em uma refatoração à parte. Endpoint que é CRUD puro, sem regra, pode ficar só com view e serializer.

Onde cada issue encaixa:

| Issue | O que cria |
|---|---|
| #59, #233 | `selectors.py` de `saude` e `usuarios` (escopo por usuário, vínculo e papel) |
| #231 | selector de agregado em `instituicoes` |
| #183 | `services.py` de `atendimentos` (confirmar, recusar, cancelar) |
| #180 | service de importação em `instituicoes` |
| #182 | service de verificação em `saude` |
| #103, #189 | serializers deixam de aceitar campos que o servidor define |

### Verificação

`backend/.importlinter`, rodado no CI com `lint-imports`:

1. apps dependem só de apps de nível mais baixo;
2. dentro do app, `urls > views > serializers > services > selectors > models`;
3. apps não importam o pacote `rastria` (usar `django.conf.settings`).

O que a ferramenta não verifica e fica por revisão: view fazendo consulta ou regra direto, em vez de chamar selector ou service.

## Frontend

```
routes      monta as rotas e as guardas
pages       uma tela por rota
features    estado e dados por área (queries.js, stores) e comportamento transversal
components  peças de interface reutilizáveis
lib         funções puras, cliente HTTP, hooks genéricos
```

- `lib` é a base: não importa de nenhuma outra pasta.
- `components` e `features` ficam no mesmo nível e podem se usar. Na prática o shell (`DashboardLayout`) precisa de sessão, tema e avisos, que vivem em `features`.
- `pages` usa tudo que está abaixo. **Uma página não importa de outra página.**
- Só `routes` importa `pages`.
- Toda chamada à API passa por `features/<área>/queries.js`. Tela não chama `lib/api.js` direto nem guarda mock.
- Estado do servidor fica no TanStack Query; Zustand só para estado local (sessão, preferências, interface).
- Autorização é do backend. `RotaProtegida` é só apresentação.

### Verificação

`frontend/eslint.config.js`, regra `no-restricted-imports`, rodada em `npm run lint`:

1. `lib/` não importa de `components`, `features`, `pages` nem `routes`;
2. `components/` e `features/` não importam de `pages` nem `routes`.

### Dívida conhecida

Páginas ainda importam `navItems` de `DashboardUsuario` e `DashboardGerente`. A regra "página não importa página" só entra no lint depois que isso for resolvido (issue #241).

## Contrato entre frontend e backend

Hoje o contrato está nos comentários `TODO` dos `queries.js`. Quando o backend for publicado (#229), gerar o esquema OpenAPI da API e usá-lo como referência na troca dos mocks (#227). Decidir na hora se o esquema fica público ou restrito a staff.

## O que isto não é

- Não é arquitetura limpa ou hexagonal: os services usam o ORM do Django diretamente.
- Não são microsserviços: um banco, um deploy de API.
- Não exige refatorar o que já existe. As regras verificadas hoje passam no código atual sem nenhuma mudança.
