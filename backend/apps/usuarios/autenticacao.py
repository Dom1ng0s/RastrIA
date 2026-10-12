"""Autenticação JWT com refresh token em cookie HttpOnly (issue #190).

Antes, access e refresh iam no corpo da resposta e o frontend guardava os dois
em `localStorage` (decisão provisória da #65): um único XSS levava o refresh de
7 dias. Agora:

- o **refresh** vai só em cookie `HttpOnly` (JavaScript não lê), `Secure`,
  `SameSite=Strict` e `Path=/api/auth/` (só os endpoints de auth o recebem);
- o **access** vai no corpo, dura 15 min e o frontend o guarda só em memória;
- refresh roda com rotação + blacklist; logout coloca o refresh na blacklist;
- troca de senha revoga tudo (ver `Usuario.save`) e o refresh também confere
  o hash da senha embutido no token;
- a sessão tem limite absoluto (`SESSAO_DURACAO_MAXIMA`) e expira por
  inatividade (`REFRESH_TOKEN_LIFETIME` curto, renovado a cada uso).

CSRF: como o refresh agora viaja sozinho no cookie, os três endpoints exigem
o header `Origin` de uma origem permitida (a própria API ou
`JWT_ORIGENS_PERMITIDAS`). `SameSite=Strict` já impede o envio cross-site; a
checagem de `Origin` é a segunda camada.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.utils import get_md5_hash_password
from rest_framework_simplejwt.views import TokenObtainPairView

CLAIM_INICIO_SESSAO = "inicio_sessao"


# --- Cookie ------------------------------------------------------------------


def _config_cookie():
    return settings.JWT_COOKIE_REFRESH


def gravar_cookie_refresh(resposta, refresh):
    config = _config_cookie()
    resposta.set_cookie(
        config["NOME"],
        str(refresh),
        max_age=int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()),
        path=config["PATH"],
        secure=config["SECURE"],
        httponly=True,
        samesite=config["SAMESITE"],
    )


def apagar_cookie_refresh(resposta):
    config = _config_cookie()
    resposta.delete_cookie(config["NOME"], path=config["PATH"], samesite=config["SAMESITE"])


def ler_cookie_refresh(request):
    return request.COOKIES.get(_config_cookie()["NOME"])


# --- CSRF por Origin ---------------------------------------------------------


def exigir_origem_permitida(request):
    origem = request.headers.get("Origin")
    if not origem:
        raise PermissionDenied("Origem da requisição ausente.")
    propria = f"{request.scheme}://{request.get_host()}"
    permitidas = {propria, *settings.JWT_ORIGENS_PERMITIDAS}
    if origem not in permitidas:
        raise PermissionDenied("Origem da requisição não permitida.")


# --- Serializers -------------------------------------------------------------


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Marca o início da sessão; a rotação preserva o claim, então ele dá o
        # limite absoluto mesmo com o refresh sendo renovado a cada uso.
        token[CLAIM_INICIO_SESSAO] = int(timezone.now().timestamp())
        return token


class RefreshPorCookieSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            refresh = RefreshToken(attrs["refresh"])  # assinatura, expiração e blacklist
        except TokenError as erro:
            raise InvalidToken(erro.args[0]) from erro

        inicio = refresh.payload.get(CLAIM_INICIO_SESSAO)
        limite = settings.SESSAO_DURACAO_MAXIMA
        if inicio is None or timezone.now().timestamp() - inicio > limite.total_seconds():
            refresh.blacklist()
            raise AuthenticationFailed("Sessão expirada. Entre novamente.", "sessao_expirada")

        usuario = get_user_model().objects.filter(
            **{api_settings.USER_ID_FIELD: refresh.payload.get(api_settings.USER_ID_CLAIM)}
        ).first()
        if usuario is None or not api_settings.USER_AUTHENTICATION_RULE(usuario):
            raise AuthenticationFailed("Conta inativa ou inexistente.", "no_active_account")

        # O simplejwt só confere o hash da senha no access; aqui o refresh
        # também deixa de valer quando a senha muda.
        if refresh.payload.get(api_settings.REVOKE_TOKEN_CLAIM) != get_md5_hash_password(usuario.password):
            refresh.blacklist()
            raise AuthenticationFailed("A senha mudou. Entre novamente.", "senha_alterada")

        return super().validate(attrs)


# --- Views -------------------------------------------------------------------


class LoginView(TokenObtainPairView):
    """`POST /api/auth/token/` — credenciais no corpo; devolve `{access}` e o
    refresh no cookie."""

    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        exigir_origem_permitida(request)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dados = serializer.validated_data
        resposta = Response({"access": dados["access"]}, status=status.HTTP_200_OK)
        gravar_cookie_refresh(resposta, dados["refresh"])
        return resposta


class RefreshView(APIView):
    """`POST /api/auth/token/refresh/` — sem corpo; lê o refresh do cookie,
    devolve `{access}` novo e roda o cookie."""

    authentication_classes = ()
    permission_classes = (AllowAny,)

    def post(self, request):
        exigir_origem_permitida(request)
        bruto = ler_cookie_refresh(request)
        if not bruto:
            return Response({"detail": "Sessão ausente."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = RefreshPorCookieSerializer(data={"refresh": bruto})
        try:
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, AuthenticationFailed):
            # 401 explícito: sem classe de autenticação, o DRF converteria em 403.
            resposta = Response({"detail": "Sessão expirada ou inválida."}, status=status.HTTP_401_UNAUTHORIZED)
            apagar_cookie_refresh(resposta)
            return resposta
        dados = serializer.validated_data
        resposta = Response({"access": dados["access"]}, status=status.HTTP_200_OK)
        gravar_cookie_refresh(resposta, dados["refresh"])
        return resposta


class LogoutView(APIView):
    """`POST /api/auth/logout/` — coloca o refresh do cookie na blacklist e
    apaga o cookie. Funciona com o access já expirado (só depende do cookie)."""

    authentication_classes = ()
    permission_classes = (AllowAny,)

    def post(self, request):
        exigir_origem_permitida(request)
        bruto = ler_cookie_refresh(request)
        if bruto:
            try:
                RefreshToken(bruto).blacklist()
            except TokenError:
                pass  # já expirado ou já na blacklist: nada a revogar
        resposta = Response(status=status.HTTP_204_NO_CONTENT)
        apagar_cookie_refresh(resposta)
        return resposta


def revogar_tokens_do_usuario(usuario):
    """Coloca na blacklist todo refresh ainda não revogado do usuário."""
    from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

    pendentes = OutstandingToken.objects.filter(user=usuario, expires_at__gt=timezone.now()).exclude(
        blacklistedtoken__isnull=False
    )
    BlacklistedToken.objects.bulk_create(
        [BlacklistedToken(token=token) for token in pendentes], ignore_conflicts=True
    )

