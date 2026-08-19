from rest_framework.routers import DefaultRouter

from .views import AtendimentoViewSet, SolicitacaoViewSet, VinculoCuidadoViewSet

router = DefaultRouter()
router.register("solicitacoes", SolicitacaoViewSet, basename="solicitacao")
router.register("atendimentos", AtendimentoViewSet, basename="atendimento")
router.register("vinculos-cuidado", VinculoCuidadoViewSet, basename="vinculo-cuidado")

urlpatterns = router.urls
