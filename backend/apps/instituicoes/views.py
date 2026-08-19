from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Instituicao, VinculoInstituicao
from .serializers import InstituicaoSerializer, VinculoInstituicaoSerializer


class InstituicaoViewSet(viewsets.ModelViewSet):
    """TODO: restringir por papel — gerente/comando só deve ver a própria
    instituição (e subunidades), não a lista completa."""

    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer
    permission_classes = [IsAuthenticated]


class VinculoInstituicaoViewSet(viewsets.ModelViewSet):
    queryset = VinculoInstituicao.objects.all()
    serializer_class = VinculoInstituicaoSerializer
    permission_classes = [IsAuthenticated]
