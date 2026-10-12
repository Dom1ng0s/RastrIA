import json
from unittest import mock

import sentry_sdk
from django.http import HttpResponse
from django.test import TestCase, override_settings
from django.urls import path
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.transport import Transport

from apps.core.monitoramento import iniciar_sentry, limpar_evento, mascarar_texto


def view_que_quebra(request):
    # O dado sensível vem da requisição, em tempo de execução — como no app
    # real. Nada dele está escrito no código-fonte (que vai como contexto).
    dados = request.POST.dict()  # noqa: F841 — variável local de propósito
    raise ValueError(f"Falha ao salvar CPF {request.POST['documento']} de {request.POST['contato']}")


def view_ok(request):
    return HttpResponse("ok")


urlpatterns = [path("quebra/", view_que_quebra), path("ok/", view_ok)]


class TransporteCaptura(Transport):
    def __init__(self, options=None):
        super().__init__(options)
        self.envelopes = []

    def capture_envelope(self, envelope):
        self.envelopes.append(envelope)


class LimparEventoTest(TestCase):
    """Issue #188: nada de dado pessoal ou clínico sai do servidor num erro."""

    def test_mascara_cpf_e_email(self):
        self.assertEqual(mascarar_texto("CPF 529.982.247-25"), "CPF [cpf]")
        self.assertEqual(mascarar_texto("52998224725"), "[cpf]")
        self.assertEqual(mascarar_texto("maria@pm.al.gov.br"), "[email]")

    def test_remove_usuario_requisicao_e_variaveis_locais(self):
        evento = {
            "user": {"id": 1, "email": "x@y.z"},
            "extra": {"a": 1},
            "server_name": "host-interno",
            "request": {
                "url": "https://api/registros-saude/?cpf=1",
                "method": "POST",
                "query_string": "cpf=1",
                "data": {"valor": 180},
                "cookies": {"sessionid": "x"},
                "headers": {"Authorization": "Bearer abc"},
                "env": {"REMOTE_ADDR": "1.2.3.4"},
            },
            "exception": {
                "values": [
                    {
                        "type": "ValueError",
                        "value": "CPF 52998224725",
                        "stacktrace": {
                            "frames": [
                                {
                                    "function": "f",
                                    "vars": {"cpf": "52998224725"},
                                    "context_line": "x = '52998224725'",
                                    "pre_context": ["# maria@pm.al.gov.br"],
                                }
                            ]
                        },
                    }
                ]
            },
            "breadcrumbs": {
                "values": [
                    {"category": "query", "message": "SELECT ... WHERE cpf = '52998224725'"},
                    {"category": "django", "message": "maria@pm.al.gov.br", "data": {"x": 1}},
                ]
            },
        }
        limpo = limpar_evento(evento)

        self.assertNotIn("user", limpo)
        self.assertNotIn("extra", limpo)
        self.assertNotIn("server_name", limpo)
        self.assertEqual(limpo["request"], {"url": "https://api/registros-saude/", "method": "POST"})
        valor = limpo["exception"]["values"][0]
        self.assertEqual(valor["value"], "CPF [cpf]")
        self.assertEqual(
            valor["stacktrace"]["frames"],
            [{"function": "f", "context_line": "x = '[cpf]'", "pre_context": ["# [email]"]}],
        )
        self.assertEqual(limpo["breadcrumbs"]["values"], [{"category": "django", "message": "[email]", "data": {}}])
        self.assertIn("user", evento)  # original intacto


class IniciarSentryTest(TestCase):
    def test_sem_dsn_nao_liga(self):
        with mock.patch.dict("os.environ", {"SENTRY_DSN": ""}), mock.patch("sentry_sdk.init") as init:
            self.assertFalse(iniciar_sentry())
            init.assert_not_called()

    def test_com_dsn_liga_sem_pii(self):
        with mock.patch.dict("os.environ", {"SENTRY_DSN": "https://k@o1.ingest.sentry.io/1"}), mock.patch(
            "sentry_sdk.init"
        ) as init:
            self.assertTrue(iniciar_sentry())
            opcoes = init.call_args.kwargs
            self.assertFalse(opcoes["send_default_pii"])
            self.assertFalse(opcoes["include_local_variables"])
            self.assertEqual(opcoes["max_request_body_size"], "never")
            self.assertIs(opcoes["before_send"], limpar_evento)


@override_settings(ROOT_URLCONF=__name__, DEBUG=False)
class ErroForcadoTest(TestCase):
    """Erro 500 real passando pela integração Django do Sentry até o transporte."""

    def setUp(self):
        self.transporte = TransporteCaptura()
        sentry_sdk.init(
            dsn="https://k@o1.ingest.sentry.io/1",
            transport=self.transporte,
            integrations=[DjangoIntegration()],
            send_default_pii=False,
            include_local_variables=False,
            max_request_body_size="never",
            before_send=limpar_evento,
            release="teste",
        )

    def tearDown(self):
        sentry_sdk.get_client().close()
        sentry_sdk.init()  # desliga para os outros testes

    def test_erro_chega_sem_dado_pessoal(self):
        self.client.raise_request_exception = False
        resposta = self.client.post(
            "/quebra/?cpf=52998224725",
            data={"documento": "529.982.247-25", "contato": "maria@pm.al.gov.br", "indice": "hemoglobina-glicada-7.9"},
            HTTP_AUTHORIZATION="Bearer segredo",
        )
        self.assertEqual(resposta.status_code, 500)
        sentry_sdk.flush()

        eventos = [item.payload.json for env in self.transporte.envelopes for item in env.items if item.type == "event"]
        self.assertEqual(len(eventos), 1)
        bruto = json.dumps(eventos[0])
        self.assertIn("ValueError", bruto)
        self.assertIn("[cpf]", bruto)
        self.assertEqual(eventos[0]["release"], "teste")
        self.assertEqual(eventos[0]["transaction"], "/quebra/")
        for proibido in ("529.982.247-25", "52998224725", "maria@", "segredo", "hemoglobina", "cpf="):
            self.assertNotIn(proibido, bruto, proibido)
