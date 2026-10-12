"""Senhas de teste geradas na hora (sem literal no código).

Scanners de segredo (GitGuardian, no PR #201) tratam par usuário/senha escrito
no código como credencial vazada, mesmo em teste. Gerar a cada execução evita
o falso positivo e garante que nenhum teste dependa de uma senha conhecida.
"""

import secrets


def nova_senha():
    return secrets.token_urlsafe(16)


SENHA = nova_senha()
