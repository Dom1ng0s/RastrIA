from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Atendimento, Solicitacao, VinculoCuidado
from .serializers import AtendimentoSerializer, SolicitacaoSerializer, VinculoCuidadoSerializer


class SolicitacaoViewSet(viewsets.ModelViewSet):
    """TODO: endpoint de confirmação pelo profissional deve mudar `status`
    explicitamente — não expor um `PATCH` genérico que permita pular a
    confirmação (ver docstring do model Solicitacao)."""

    queryset = Solicitacao.objects.all()
    serializer_class = SolicitacaoSerializer
    permission_classes = [IsAuthenticated]


class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer
    permission_classes = [IsAuthenticated]


class VinculoCuidadoViewSet(viewsets.ModelViewSet):
    queryset = VinculoCuidado.objects.all()
    serializer_class = VinculoCuidadoSerializer
    permission_classes = [IsAuthenticated]
