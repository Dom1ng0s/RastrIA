import os

from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["*"]
# Com CORS_ALLOW_CREDENTIALS (cookie de refresh, #190), "todas as origens"
# deixaria qualquer site usar a sessão de quem está logado no dev. Só o Vite.
ORIGENS_DEV = ["http://localhost:5173", "http://127.0.0.1:5173"]
CORS_ALLOWED_ORIGINS = ORIGENS_DEV
JWT_ORIGENS_PERMITIDAS = ORIGENS_DEV
# localhost é http: sem Secure o navegador não guardaria o cookie.
JWT_COOKIE_REFRESH = {**JWT_COOKIE_REFRESH, "SECURE": False}  # noqa: F405

# Em dev, DEBUG só para o código do projeto — o resto (urllib3, asyncio...)
# segue o nível base, para o terminal não virar ruído.
LOGGING["loggers"]["apps"] = {  # noqa: F405
    "handlers": ["console"],
    "level": os.getenv("DJANGO_LOG_LEVEL", "DEBUG").upper(),
    "propagate": False,
}
