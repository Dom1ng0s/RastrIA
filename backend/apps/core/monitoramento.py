"""Monitoramento de erros do backend com Sentry (issue #188).

Só liga com `SENTRY_DSN` definido — sem ele, nada é carregado nem enviado.
Privacidade (dado de saúde, LGPD art. 11): `send_default_pii=False`, sem
tracing, e todo evento passa por `limpar_evento` antes de sair do servidor —
nada de corpo de requisição, query string, cookie, header, usuário, CPF ou
e-mail. O que sobra (tipo e pilha do erro, rota, release) basta para depurar.
"""

import os
import re

CPF = re.compile(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b")
EMAIL = re.compile(r"[^\s@\"'<>]+@[^\s@\"'<>]+\.[^\s@\"'<>]+")

# Breadcrumbs de log podem carregar dado formatado na mensagem; os de SQL,
# os valores das queries. Ficam só os que descrevem o fluxo.
CATEGORIAS_DESCARTADAS = {"query", "django.db.backends"}


def mascarar_texto(texto):
    if not isinstance(texto, str):
        return texto
    return EMAIL.sub("[email]", CPF.sub("[cpf]", texto))


def _url_sem_parametros(url):
    if not isinstance(url, str):
        return url
    return re.split(r"[?#]", url, maxsplit=1)[0]


def _limpar_frame(frame):
    limpo = {k: v for k, v in frame.items() if k != "vars"}
    if "context_line" in limpo:
        limpo["context_line"] = mascarar_texto(limpo["context_line"])
    for chave in ("pre_context", "post_context"):
        if isinstance(limpo.get(chave), list):
            limpo[chave] = [mascarar_texto(linha) for linha in limpo[chave]]
    return limpo


def limpar_evento(evento, _hint=None):
    """`before_send` do Sentry: devolve uma cópia sem dado pessoal ou clínico."""
    if not evento:
        return evento
    limpo = dict(evento)

    limpo.pop("user", None)
    limpo.pop("extra", None)
    limpo.pop("server_name", None)

    if "request" in limpo:
        requisicao = limpo["request"]
        limpo["request"] = {
            chave: _url_sem_parametros(requisicao[chave]) if chave == "url" else requisicao[chave]
            for chave in ("url", "method")
            if requisicao.get(chave)
        }

    if isinstance(limpo.get("logentry"), dict):
        limpo["logentry"] = {
            "message": mascarar_texto(limpo["logentry"].get("message")),
            "params": [],
        }
    if "message" in limpo:
        limpo["message"] = mascarar_texto(limpo["message"])

    if isinstance(limpo.get("exception"), dict):
        valores = []
        for valor in limpo["exception"].get("values", []):
            valor = dict(valor)
            valor["value"] = mascarar_texto(valor.get("value"))
            # Variáveis locais de cada frame podem conter o próprio dado de
            # saúde; as linhas de código ao redor ficam, mascaradas.
            if isinstance(valor.get("stacktrace"), dict):
                frames = [_limpar_frame(f) for f in valor["stacktrace"].get("frames", [])]
                valor["stacktrace"] = {**valor["stacktrace"], "frames": frames}
            valores.append(valor)
        limpo["exception"] = {**limpo["exception"], "values": valores}

    breadcrumbs = limpo.get("breadcrumbs")
    if isinstance(breadcrumbs, dict):
        limpo["breadcrumbs"] = {
            **breadcrumbs,
            "values": [
                {**b, "message": mascarar_texto(b.get("message")), "data": {}}
                for b in breadcrumbs.get("values", [])
                if b.get("category") not in CATEGORIAS_DESCARTADAS
            ],
        }

    return limpo


def iniciar_sentry():
    """Inicializa o Sentry se `SENTRY_DSN` existir. Chamado em settings/prod.py."""
    dsn = os.getenv("SENTRY_DSN", "").strip()
    if not dsn:
        return False

    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=dsn,
        release=os.getenv("SENTRY_RELEASE") or os.getenv("RAILWAY_GIT_COMMIT_SHA") or None,
        environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
        integrations=[DjangoIntegration()],
        send_default_pii=False,
        include_local_variables=False,
        max_request_body_size="never",
        traces_sample_rate=0,
        before_send=limpar_evento,
    )
    return True
