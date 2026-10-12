from datetime import timedelta

from django.conf import settings
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken

from apps.usuarios.autenticacao import CLAIM_INICIO_SESSAO
from apps.usuarios.models import Usuario
from tests.credenciais import SENHA, nova_senha

ORIGEM = "http://testserver"
COOKIE = settings.JWT_COOKIE_REFRESH["NOME"]


class SessaoJwtTest(TestCase):
    """Issue #190: refresh em cookie HttpOnly, access curto, rotação, logout
    no servidor, revogação na troca de senha, limites de sessão e CSRF."""

    @classmethod
    def setUpTestData(cls):
        cls.usuario = Usuario.objects.create_user(username="maria", password=SENHA)

    def setUp(self):
        self.client = APIClient()

    def entrar(self, origem=ORIGEM):
        extra = {"HTTP_ORIGIN": origem} if origem else {}
        return self.client.post("/api/auth/token/", {"username": "maria", "password": SENHA}, **extra)

    @staticmethod
    def na_blacklist(token):
        jti = RefreshToken(token, verify=False)["jti"]
        return BlacklistedToken.objects.filter(token__jti=jti).exists()

    def renovar(self, origem=ORIGEM):
        extra = {"HTTP_ORIGIN": origem} if origem else {}
        return self.client.post("/api/auth/token/refresh/", **extra)

    # --- login ---------------------------------------------------------------

    def test_login_devolve_so_access_no_corpo_e_refresh_em_cookie_httponly(self):
        resposta = self.entrar()
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(set(resposta.data), {"access"})
        cookie = resposta.cookies[COOKIE]
        self.assertTrue(cookie["httponly"])
        self.assertEqual(cookie["samesite"], "Strict")
        self.assertEqual(cookie["path"], "/api/auth/")
        self.assertEqual(int(cookie["max-age"]), 45 * 60)

    @override_settings(JWT_COOKIE_REFRESH={**settings.JWT_COOKIE_REFRESH, "SECURE": True})
    def test_cookie_e_secure_fora_do_dev(self):
        self.assertTrue(self.entrar().cookies[COOKIE]["secure"])

    def test_access_dura_15_minutos(self):
        self.assertEqual(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"], timedelta(minutes=15))

    def test_access_autentica_na_api(self):
        access = self.entrar().data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.assertEqual(self.client.get("/api/regras-verificacao/").status_code, 200)

    def test_credencial_errada_nao_grava_cookie(self):
        resposta = self.client.post(
            "/api/auth/token/", {"username": "maria", "password": nova_senha()}, HTTP_ORIGIN=ORIGEM
        )
        self.assertEqual(resposta.status_code, 401)
        self.assertNotIn(COOKIE, resposta.cookies)

    # --- CSRF por Origin -----------------------------------------------------

    def test_login_sem_origin_ou_de_outra_origem_e_recusado(self):
        self.assertEqual(self.entrar(origem=None).status_code, 403)
        resposta = self.entrar(origem="https://evil.example")
        self.assertEqual(resposta.status_code, 403)

    def test_refresh_de_outra_origem_e_recusado(self):
        self.entrar()
        self.assertEqual(self.renovar(origem="https://evil.example").status_code, 403)
        self.assertEqual(self.renovar(origem=None).status_code, 403)

    @override_settings(JWT_ORIGENS_PERMITIDAS=["https://rastria.exemplo.com"])
    def test_origem_configurada_e_aceita(self):
        self.assertEqual(self.entrar(origem="https://rastria.exemplo.com").status_code, 200)

    # --- refresh -------------------------------------------------------------

    def test_refresh_le_o_cookie_roda_o_token_e_poe_o_antigo_na_blacklist(self):
        self.entrar()
        antigo = self.client.cookies[COOKIE].value

        resposta = self.renovar()
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(set(resposta.data), {"access"})
        novo = resposta.cookies[COOKIE].value
        self.assertNotEqual(novo, antigo)
        self.assertTrue(self.na_blacklist(antigo))

        # Reusar o refresh antigo (roubado) não funciona e apaga o cookie.
        self.client.cookies[COOKIE] = antigo
        resposta = self.renovar()
        self.assertEqual(resposta.status_code, 401)
        self.assertEqual(resposta.cookies[COOKIE].value, "")

    def test_refresh_no_corpo_e_ignorado(self):
        refresh = str(RefreshToken.for_user(self.usuario))
        resposta = self.client.post("/api/auth/token/refresh/", {"refresh": refresh}, HTTP_ORIGIN=ORIGEM)
        self.assertEqual(resposta.status_code, 401)

    def test_sem_cookie_responde_401(self):
        self.assertEqual(self.renovar().status_code, 401)

    def test_refresh_expira_por_inatividade(self):
        self.entrar()
        token = RefreshToken(self.client.cookies[COOKIE].value)
        token.set_exp(from_time=timezone.now() - timedelta(hours=1))
        self.client.cookies[COOKIE] = str(token)
        self.assertEqual(self.renovar().status_code, 401)

    def test_sessao_tem_limite_absoluto_mesmo_com_uso(self):
        self.entrar()
        token = RefreshToken(self.client.cookies[COOKIE].value)
        token[CLAIM_INICIO_SESSAO] = int((timezone.now() - timedelta(hours=13)).timestamp())
        self.client.cookies[COOKIE] = str(token)
        self.assertEqual(self.renovar().status_code, 401)

    def test_usuario_inativo_ou_apagado_nao_renova(self):
        self.entrar()
        Usuario.objects.filter(pk=self.usuario.pk).update(is_active=False)
        self.assertEqual(self.renovar().status_code, 401)
        self.entrar_como_outro_e_apagar()

    def entrar_como_outro_e_apagar(self):
        outro = Usuario.objects.create_user(username="joao", password=SENHA)
        self.client.cookies[COOKIE] = str(RefreshToken.for_user(outro))
        outro.delete()
        self.assertEqual(self.renovar().status_code, 401)  # antes: 500 (DoesNotExist)

    # --- logout --------------------------------------------------------------

    def test_logout_poe_refresh_na_blacklist_e_apaga_cookie(self):
        self.entrar()
        refresh = self.client.cookies[COOKIE].value

        resposta = self.client.post("/api/auth/logout/", HTTP_ORIGIN=ORIGEM)
        self.assertEqual(resposta.status_code, 204)
        self.assertEqual(resposta.cookies[COOKIE].value, "")
        self.assertTrue(self.na_blacklist(refresh))

        self.client.cookies[COOKIE] = refresh
        self.assertEqual(self.renovar().status_code, 401)

    def test_logout_sem_sessao_nao_quebra(self):
        self.assertEqual(self.client.post("/api/auth/logout/", HTTP_ORIGIN=ORIGEM).status_code, 204)

    def test_logout_de_outra_origem_e_recusado(self):
        self.entrar()
        self.assertEqual(self.client.post("/api/auth/logout/", HTTP_ORIGIN="https://evil.example").status_code, 403)

    # --- troca de senha ------------------------------------------------------

    def test_troca_de_senha_revoga_access_e_refresh(self):
        access = self.entrar().data["access"]
        refresh = self.client.cookies[COOKIE].value

        usuario = Usuario.objects.get(pk=self.usuario.pk)
        usuario.set_password(nova_senha())
        usuario.save()

        self.assertTrue(self.na_blacklist(refresh))
        self.assertEqual(self.renovar().status_code, 401)

        cliente = APIClient()
        cliente.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.assertEqual(cliente.get("/api/regras-verificacao/").status_code, 401)

    def test_refresh_emitido_antes_da_troca_falha_mesmo_fora_da_blacklist(self):
        # Defesa em profundidade: senha trocada direto no banco (sem save do
        # model) não passa pela revogação, mas o hash no token não bate mais.
        self.entrar()
        Usuario.objects.filter(pk=self.usuario.pk).update(password=f"pbkdf2_sha256$1${nova_senha()}$hash-qualquer")
        self.assertEqual(self.renovar().status_code, 401)

    def test_salvar_sem_trocar_senha_nao_revoga(self):
        self.entrar()
        usuario = Usuario.objects.get(pk=self.usuario.pk)
        usuario.first_name = "Maria"
        usuario.save()
        self.assertEqual(self.renovar().status_code, 200)
