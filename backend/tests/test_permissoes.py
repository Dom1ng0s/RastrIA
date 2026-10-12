"""Matriz de permissão papel × endpoint (issue #68).

É a rede de segurança da segregação de acesso por papel — a garantia central
vendida ao cliente institucional (agents/claude.md, "Domínio — Papéis e
Acesso").

Duas partes:

1. **O que já vale hoje** — testes normais. Se quebrarem, é regressão.
2. **Vulnerabilidades conhecidas, ainda abertas** — cada uma com o
   comportamento CORRETO afirmado e marcada `@expectedFailure` com a issue que
   a corrige (#59, #60, #103, #189). Não é teste desligado: roda sempre e
   documenta a falha. No dia em que a correção entrar, o teste passa, o
   unittest acusa "unexpected success" e o CI fica vermelho até alguém tirar
   o `@expectedFailure` — a vulnerabilidade não pode ser "consertada sem
   querer" e depois voltar sem ninguém ver.
"""

from datetime import date
from unittest import expectedFailure

from django.test import TestCase
from rest_framework.test import APIClient

from apps.atendimentos.models import Solicitacao
from apps.instituicoes.models import Instituicao
from apps.profissionais.models import Profissional
from apps.saude.models import RegistroSaude, RegraVerificacao
from apps.usuarios.models import Papel, Usuario

ENDPOINTS = [
    "/api/usuarios/",
    "/api/instituicoes/",
    "/api/vinculos-institucionais/",
    "/api/registros-saude/",
    "/api/regras-verificacao/",
    "/api/profissionais/",
    "/api/solicitacoes/",
    "/api/atendimentos/",
    "/api/vinculos-cuidado/",
]

# Todos os papéis do domínio. Nenhum deles, sem vínculo de cuidado, deveria
# ler o dado individual de outra pessoa — médico e médico do trabalho só com
# vínculo, e aqui nenhum tem.
PAPEIS = [papel for papel, _ in Papel.choices]


class BaseMatriz(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.usuarios = {
            papel: Usuario.objects.create_user(username=f"u-{papel}", password="senha-forte-123", papel=papel)
            for papel in PAPEIS
        }
        cls.dono = Usuario.objects.create_user(username="dono", password="senha-forte-123", papel=Papel.INTEGRANTE)
        cls.registro_do_dono = RegistroSaude.objects.create(
            usuario=cls.dono, tipo="laboratorial", indice="glicemia", valor=180, data=date(2026, 9, 1)
        )
        cls.instituicao = Instituicao.objects.create(nome="Batalhão")
        cls.regra = RegraVerificacao.objects.create(tipo="laboratorial", indice="glicemia", fonte="MS")

    def cliente(self, usuario=None):
        cliente = APIClient()
        if usuario:
            cliente.force_authenticate(usuario)
        return cliente


# --- 1. O que já vale hoje ---------------------------------------------------


class ProtecoesAtuaisTest(BaseMatriz):
    def test_anonimo_nao_acessa_nenhum_endpoint(self):
        cliente = self.cliente()
        for endpoint in ENDPOINTS:
            for metodo in ("get", "post"):
                with self.subTest(endpoint=endpoint, metodo=metodo):
                    resposta = getattr(cliente, metodo)(endpoint, {})
                    self.assertEqual(resposta.status_code, 401)

    def test_anonimo_nao_le_registro_de_saude_por_id(self):
        resposta = self.cliente().get(f"/api/registros-saude/{self.registro_do_dono.pk}/")
        self.assertEqual(resposta.status_code, 401)

    def test_ninguem_marca_o_proprio_registro_profissional_como_verificado(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                Profissional.objects.filter(usuario=usuario).delete()
                resposta = self.cliente(usuario).post(
                    "/api/profissionais/",
                    {
                        "usuario": usuario.pk,
                        "especialidade": "medico",
                        "registro_profissional": "CRM-1",
                        "registro_verificado": True,
                    },
                )
                if resposta.status_code == 201:
                    self.assertFalse(Profissional.objects.get(usuario=usuario).registro_verificado)

    def test_ninguem_confirma_solicitacao_pelo_payload(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                resposta = self.cliente(usuario).post(
                    "/api/solicitacoes/",
                    {"usuario": usuario.pk, "especialidade": "medico", "status": "confirmada"},
                )
                if resposta.status_code == 201:
                    self.assertEqual(Solicitacao.objects.get(pk=resposta.data["id"]).status, "pendente")

    def test_usuario_nao_ve_hash_de_senha_nem_flags_de_staff(self):
        resposta = self.cliente(self.dono).get(f"/api/usuarios/{self.dono.pk}/")
        self.assertEqual(resposta.status_code, 200)
        for campo in ("password", "is_staff", "is_superuser", "groups", "user_permissions"):
            self.assertNotIn(campo, resposta.data)


# --- 2. Vulnerabilidades conhecidas (comportamento correto, ainda falhando) ---


class VulnerabilidadesAbertasTest(BaseMatriz):
    @expectedFailure  # #59 — RegistroSaudeViewSet sem escopo por usuário/papel
    def test_nenhum_papel_sem_vinculo_le_registro_de_saude_de_outra_pessoa(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                resposta = self.cliente(usuario).get(f"/api/registros-saude/{self.registro_do_dono.pk}/")
                self.assertIn(resposta.status_code, (403, 404))

    @expectedFailure  # #59
    def test_listagem_de_registros_so_traz_os_proprios(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                resposta = self.cliente(usuario).get("/api/registros-saude/")
                donos = {item["usuario"] for item in resposta.data["results"]}
                self.assertLessEqual(donos, {usuario.pk})

    @expectedFailure  # #59
    def test_ninguem_cria_registro_de_saude_em_nome_de_outra_pessoa(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                self.cliente(usuario).post(
                    "/api/registros-saude/",
                    {
                        "usuario": self.dono.pk,
                        "tipo": "laboratorial",
                        "indice": "x",
                        "valor": "1",
                        "data": "2026-09-02",
                    },
                )
                self.assertEqual(RegistroSaude.objects.filter(usuario=self.dono).count(), 1)

    @expectedFailure  # #59
    def test_ninguem_apaga_registro_de_saude_de_outra_pessoa(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                self.cliente(usuario).delete(f"/api/registros-saude/{self.registro_do_dono.pk}/")
                self.assertTrue(RegistroSaude.objects.filter(pk=self.registro_do_dono.pk).exists())

    @expectedFailure  # #59 — UsuarioViewSet lista todo o efetivo
    def test_usuario_comum_nao_lista_outros_usuarios(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                resposta = self.cliente(usuario).get("/api/usuarios/")
                ids = {item["id"] for item in resposta.data["results"]}
                self.assertEqual(ids, {usuario.pk})

    @expectedFailure  # #59
    def test_ninguem_altera_ou_apaga_a_conta_de_outra_pessoa(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                self.cliente(usuario).patch(f"/api/usuarios/{self.dono.pk}/", {"email": "atacante@x.com"})
                self.cliente(usuario).delete(f"/api/usuarios/{self.dono.pk}/")
                self.dono.refresh_from_db()
                self.assertNotEqual(self.dono.email, "atacante@x.com")

    @expectedFailure  # #103 — `papel` gravável no UsuarioSerializer
    def test_ninguem_muda_o_proprio_papel(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                alvo = Papel.MEDICO if papel == Papel.GERENTE else Papel.GERENTE
                self.cliente(usuario).patch(f"/api/usuarios/{usuario.pk}/", {"papel": alvo})
                usuario.refresh_from_db()
                self.assertEqual(usuario.papel, papel)

    @expectedFailure  # #189 — VinculoInstituicao.papel/usuario vindos do payload
    def test_ninguem_se_vincula_a_instituicao_como_gerente(self):
        for papel, usuario in self.usuarios.items():
            if papel == Papel.GERENTE:
                continue
            with self.subTest(papel=papel):
                resposta = self.cliente(usuario).post(
                    "/api/vinculos-institucionais/",
                    {"usuario": usuario.pk, "instituicao": self.instituicao.pk, "papel": Papel.GERENTE},
                )
                self.assertIn(resposta.status_code, (400, 403))

    @expectedFailure  # #189 — Instituicao gravável por qualquer autenticado
    def test_so_staff_cria_ou_reparenta_instituicao(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                resposta = self.cliente(usuario).post("/api/instituicoes/", {"nome": "Unidade fantasma"})
                self.assertIn(resposta.status_code, (403, 405))

    @expectedFailure  # #60 — RegraVerificacao gravável por qualquer autenticado
    def test_so_staff_altera_a_tabela_de_referencia_clinica(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                self.cliente(usuario).patch(f"/api/regras-verificacao/{self.regra.pk}/", {"valor_maximo": "999"})
                self.regra.refresh_from_db()
                self.assertIsNone(self.regra.valor_maximo)

    @expectedFailure  # #60 — qualquer autenticado cria Profissional
    def test_so_staff_cadastra_profissional(self):
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                resposta = self.cliente(usuario).post(
                    "/api/profissionais/",
                    {"usuario": self.dono.pk, "especialidade": "medico", "registro_profissional": "CRM-X"},
                )
                self.assertIn(resposta.status_code, (403, 405))

    @expectedFailure  # #189/#183 — atendimento/vínculo de cuidado por POST genérico
    def test_ninguem_cria_vinculo_de_cuidado_por_post_generico(self):
        medico = Profissional.objects.create(
            usuario=self.usuarios[Papel.MEDICO], especialidade="medico", registro_profissional="CRM-2"
        )
        for papel, usuario in self.usuarios.items():
            with self.subTest(papel=papel):
                resposta = self.cliente(usuario).post(
                    "/api/vinculos-cuidado/", {"usuario": self.dono.pk, "profissional": medico.pk, "ativo": True}
                )
                self.assertIn(resposta.status_code, (403, 405))
