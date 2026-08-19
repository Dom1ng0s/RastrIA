from rest_framework.routers import DefaultRouter

from .views import InstituicaoViewSet, VinculoInstituicaoViewSet

router = DefaultRouter()
router.register("instituicoes", InstituicaoViewSet, basename="instituicao")
router.register("vinculos-institucionais", VinculoInstituicaoViewSet, basename="vinculo-institucional")

urlpatterns = router.urls
