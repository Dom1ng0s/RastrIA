import os

from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

# Em dev, DEBUG só para o código do projeto — o resto (urllib3, asyncio...)
# segue o nível base, para o terminal não virar ruído.
LOGGING["loggers"]["apps"] = {  # noqa: F405
    "handlers": ["console"],
    "level": os.getenv("DJANGO_LOG_LEVEL", "DEBUG").upper(),
    "propagate": False,
}
