import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "inseguro-trocar-em-producao")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "apps.core",
    "apps.usuarios",
    "apps.instituicoes",
    "apps.saude",
    "apps.profissionais",
    "apps.atendimentos",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "rastria.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "rastria.wsgi.application"
ASGI_APPLICATION = "rastria.asgi.application"

AUTH_USER_MODEL = "usuarios.Usuario"

DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Maceio"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    # Toda listagem paginada (issue #121) — ver apps/core/paginacao.py.
    "DEFAULT_PAGINATION_CLASS": "apps.core.paginacao.PaginacaoPadrao",
}

# Sessão JWT (issue #190) — ver apps/usuarios/autenticacao.py.
# - access curto, só em memória no frontend;
# - refresh em cookie HttpOnly, rodado e posto na blacklist a cada uso. Seu
#   tempo de vida é o limite de INATIVIDADE no servidor: 30 min sem chamar a
#   API + os 15 min do último access (o refresh só é usado quando o access
#   expira). O aviso exato de 30 min fica no cliente (SessaoInativa.jsx);
# - limite absoluto de sessão, mesmo com uso contínuo;
# - CHECK_REVOKE_TOKEN: access emitido antes de uma troca de senha deixa de
#   valer (o refresh é revogado em Usuario.save).
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(minutes=45),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "CHECK_REVOKE_TOKEN": True,
}
SESSAO_DURACAO_MAXIMA = timedelta(hours=12)

JWT_COOKIE_REFRESH = {
    "NOME": "rastria_refresh",
    "PATH": "/api/auth/",
    "SECURE": os.getenv("JWT_COOKIE_SECURE", "true").lower() == "true",
    # Strict exige frontend e API no mesmo "site" (mesmo domínio registrável).
    # *.up.railway.app NÃO conta como um site só (está na Public Suffix List):
    # em produção, servir os dois sob domínio próprio (ex.: app. e api.) —
    # ver "Sessão e cookies" em agents/claude.md.
    "SAMESITE": os.getenv("JWT_COOKIE_SAMESITE", "Strict"),
}

# Origens aceitas no header Origin dos endpoints de auth (CSRF, #190), além da
# própria API. Por padrão, as mesmas do CORS.
JWT_ORIGENS_PERMITIDAS = [
    o.strip() for o in os.getenv("JWT_ORIGENS_PERMITIDAS", os.getenv("CORS_ALLOWED_ORIGINS", "")).split(",") if o.strip()
]

# O cookie de refresh só é enviado cross-origin com credenciais.
CORS_ALLOW_CREDENTIALS = True

# Logs (issue #188): tudo para stdout — o Railway coleta. Nível por ambiente
# via `DJANGO_LOG_LEVEL` (padrão INFO; dev.py usa DEBUG). Erros 500 também vão
# para o Sentry quando `SENTRY_DSN` existe (apps/core/monitoramento.py).
LOG_LEVEL = os.getenv("DJANGO_LOG_LEVEL", "INFO").upper()

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "padrao": {"format": "{asctime} {levelname} {name} {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "padrao"},
    },
    "root": {"handlers": ["console"], "level": LOG_LEVEL},
    "loggers": {
        "django": {"handlers": ["console"], "level": LOG_LEVEL, "propagate": False},
        # SQL com parâmetros só sob demanda: os valores são dado de saúde.
        "django.db.backends": {"handlers": ["console"], "level": "WARNING", "propagate": False},
    },
}
