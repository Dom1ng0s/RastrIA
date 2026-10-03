# Roteiro de teste manual de acessibilidade

Ferramenta automática cobre de 30% a 40% dos critérios da WCAG. O resto —
ordem de leitura, foco que faz sentido, texto que dá para entender, nome que
descreve o que o controle faz — só aparece usando. Este roteiro é a outra
metade, e o eMAG pede as duas (avaliador automático **e** validação humana).

Meta: **WCAG 2.2 nível AA** + **eMAG 3.1**.

## O que já é automático (não repetir à mão)

| Verificação | Comando |
|---|---|
| Lint de acessibilidade no JSX (`jsx-a11y`) | `npm run lint` |
| axe por componente + aba Acessibilidade | `npm test` |
| axe por página: 11 rotas × tema claro/escuro × preferências ligadas, reflow em 320px | `npm run test:a11y` |

Rodar os três antes de abrir PR que mexa em tela. O roteiro abaixo é para
**antes de uma entrega** (release de piloto) e sempre que uma tela nova nascer.

## 1. Só teclado (sem mouse) — 15 min

Desconecte o mouse ou guarde a mão. Em `/login`, `/usuario`,
`/usuario/ranking`, `/perfil` e um modal qualquer:

- [ ] A **primeira** tecla Tab revela "Pular para o conteúdo" e ele funciona.
- [ ] `Alt + 1` vai para o conteúdo, `Alt + 2` para o menu.
- [ ] Dá para chegar em todo controle, e a ordem segue a ordem visual.
- [ ] O foco é **sempre visível** — inclusive sobre fundo escuro e dentro de modal.
- [ ] Nenhuma armadilha de foco: de qualquer ponto dá para sair só com Tab.
- [ ] Modal: abre com foco dentro, Tab circula só nele, `Esc` fecha e o foco
      **volta para o botão que abriu**.
- [ ] Menus suspensos (notificações, ajuda) abrem, navegam com setas e fecham com `Esc`.
- [ ] Nada acontece só com o mouse: tudo que clica, aciona com Enter ou Espaço.

## 2. Leitor de tela — 30 min

**NVDA + Firefox** (combinação mais usada no Brasil) é o mínimo. Repetir no
**VoiceOver (iOS)** antes de entregar, se houver uso em celular.

- [ ] Ao trocar de tela, o título novo é anunciado.
- [ ] Cada tela tem **um** `<h1>` e ele diz o que é aquela tela.
- [ ] Navegar só por títulos (tecla `H`) conta a história da tela.
- [ ] Formulário: cada campo é lido com rótulo, se é obrigatório e o formato
      esperado. Ao errar, o erro é anunciado e leva ao campo.
- [ ] Força de senha: critérios anunciados como cumprido/pendente, e o nível
      muda em voz ("Força da senha: média").
- [ ] Ranking: "1º lugar, Fulano, 21:04" e "Você" na própria linha.
- [ ] Botões de ícone (olhinho, fechar, notificações) têm nome que descreve a ação.
- [ ] Avisos de sucesso/erro são anunciados sem roubar o foco.
- [ ] Tabela de importação é lida com cabeçalho de coluna.
- [ ] Nada decorativo é anunciado ("imagem", "gráfico" soltos).

## 3. Enxergar de outro jeito — 20 min

- [ ] **Zoom 200%** e **400%** no navegador: nada some, nada se sobrepõe.
- [ ] Largura **320px** (DevTools): sem rolagem horizontal (WCAG 1.4.10).
- [ ] **Escala de cinza** (DevTools → Rendering → Emulate vision deficiencies →
      achromatopsia): toda informação continua compreensível — pódio, badges
      normal/atenção/alterado, filtros selecionados, critérios de senha.
- [ ] **Deuteranopia** e **protanopia** no mesmo menu, com e sem o toggle
      "Filtro para daltonismo".
- [ ] **Espaçamento de texto** (bookmarklet do WCAG 1.4.12, ou o toggle da aba):
      nada corta nem some.
- [ ] **Modo de alto contraste do Windows** (`forced-colors`): texto, bordas e
      foco continuam visíveis.
- [ ] Tema escuro em todas as telas acima.

## 4. Aba Configurações › Acessibilidade — 10 min

Para **cada** preferência da aba:

- [ ] Ligar, recarregar a página: continua ligada.
- [ ] O efeito aparece de verdade (não só o toggle muda).
- [ ] "Restaurar padrões" desfaz tudo.
- [ ] Com o sistema operacional em alto contraste / movimento reduzido, a
      preferência correspondente já nasce ligada.

## 5. Tempo e interrupção — 5 min

- [ ] Sessão: o aviso de expiração aparece 2 minutos antes e dá para renovar.
- [ ] Com "Reduzir movimento": nenhuma animação, nenhum beacon pulsando.
- [ ] Avisos de sucesso somem no tempo configurado; de erro, só ao fechar.
      Passar o mouse ou o foco sobre um aviso pausa o tempo.

## Registro

Cada barreira encontrada vira issue com a etiqueta `accessibility`, descrevendo
**o que a pessoa não conseguiu fazer**, não só a regra violada. A página pública
`/acessibilidade` aponta para essa lista, e a data da última avaliação dela
precisa ser atualizada a cada rodada deste roteiro.
