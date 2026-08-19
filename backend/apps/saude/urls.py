from rest_framework.routers import DefaultRouter

from .views import RegistroSaudeViewSet, RegraVerificacaoViewSet

router = DefaultRouter()
router.register("registros-saude", RegistroSaudeViewSet, basename="registro-saude")
router.register("regras-verificacao", RegraVerificacaoViewSet, basename="regra-verificacao")

urlpatterns = router.urls
