from django.test import TestCase
from rest_framework.test import APIClient

from apps.saude.models import RegraVerificacao
from apps.usuarios.models import Usuario


class PaginacaoPadraoTest(TestCase):
    """Issue #121: toda listagem da API é paginada, com teto de page_size."""

    @classmethod
    def setUpTestData(cls):
        cls.usuario = Usuario.objects.create_user(username="pag", password="senha-forte-123")
        RegraVerificacao.objects.bulk_create(
            RegraVerificacao(tipo="laboratorial", indice=f"indice-{i}", fonte="teste") for i in range(130)
        )

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(self.usuario)

    def test_lista_vem_paginada_com_20_por_pagina(self):
        resposta = self.client.get("/api/regras-verificacao/")
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(set(resposta.data), {"count", "next", "previous", "results"})
        self.assertEqual(resposta.data["count"], 130)
        self.assertEqual(len(resposta.data["results"]), 20)
        self.assertIsNone(resposta.data["previous"])
        self.assertIn("page=2", resposta.data["next"])

    def test_page_size_pedido_pelo_cliente(self):
        resposta = self.client.get("/api/regras-verificacao/", {"page": 2, "page_size": 50})
        self.assertEqual(len(resposta.data["results"]), 50)

    def test_page_size_tem_teto(self):
        resposta = self.client.get("/api/regras-verificacao/", {"page_size": 10_000})
        self.assertEqual(len(resposta.data["results"]), 100)

    def test_paginas_nao_repetem_nem_pulam_itens(self):
        ids = []
        for pagina in range(1, 8):
            resposta = self.client.get("/api/regras-verificacao/", {"page": pagina})
            ids += [item["id"] for item in resposta.data["results"]]
        self.assertEqual(ids, sorted(RegraVerificacao.objects.values_list("pk", flat=True)))

    def test_pagina_inexistente_devolve_404(self):
        resposta = self.client.get("/api/regras-verificacao/", {"page": 99})
        self.assertEqual(resposta.status_code, 404)
