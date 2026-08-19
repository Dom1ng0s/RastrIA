from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("apps.usuarios.urls")),
    path("api/", include("apps.instituicoes.urls")),
    path("api/", include("apps.saude.urls")),
    path("api/", include("apps.profissionais.urls")),
    path("api/", include("apps.atendimentos.urls")),
]
