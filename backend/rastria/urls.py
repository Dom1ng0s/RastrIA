from django.contrib import admin
from django.urls import include, path

from apps.usuarios.autenticacao import LoginView, LogoutView, RefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", LoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", RefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
    path("api/", include("apps.usuarios.urls")),
    path("api/", include("apps.instituicoes.urls")),
    path("api/", include("apps.saude.urls")),
    path("api/", include("apps.profissionais.urls")),
    path("api/", include("apps.atendimentos.urls")),
]
