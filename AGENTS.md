# Instruções para agentes de código

Vale para qualquer agente (Claude Code, Codex, Cursor, Copilot e outros) e para quem coda à mão.

## Antes de escrever código

1. **Leia [docs/DEPENDENCIAS_ISSUES.md](docs/DEPENDENCIAS_ISSUES.md).** Ache a issue em que vai trabalhar e veja a coluna "Bloqueada por".
2. **Confira o estado real dos bloqueios** com `gh issue view <número> --json state`. O arquivo pode estar atrasado em relação ao GitHub.
3. **Se houver bloqueio aberto, não comece.** Diga qual é o bloqueio e proponha resolvê-lo primeiro. Só siga adiante com confirmação explícita de quem pediu.
4. **Se a tarefa não tiver issue**, ou a issue não estiver no arquivo, diga isso antes de começar e acrescente-a ao mapa.

## Ao terminar

- No PR que fecha uma issue, atualize `docs/DEPENDENCIAS_ISSUES.md`: remova a linha, o nó e as setas dela.
- Ao abrir uma issue nova, acrescente-a ao mapa na etapa certa.

## Guia do projeto

Domínio, regras de acesso por papel, decisões de arquitetura, deploy e identidade de marca estão em [agents/claude.md](agents/claude.md). Leia antes de mexer em autenticação, permissões ou dado de saúde.

Regras que não se quebram, em resumo:

- Gestão/comando nunca recebe dado clínico individual, só agregado e status administrativo.
- Autorização vive no backend; guarda de rota no frontend é só apresentação.
- Conexão com profissional é solicitação → confirmação, nunca aceite automático.
- CPF sempre mascarado em tela e nunca em URL.
- O repositório é público: nada de documento de negociação institucional nem dado pessoal.
