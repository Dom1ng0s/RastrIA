from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import RegistroSaude, RegraVerificacao
from .serializers import RegistroSaudeSerializer, RegraVerificacaoSerializer


class RegistroSaudeViewSet(viewsets.ModelViewSet):
    """TODO: restringir queryset ao próprio usuário, exceto para o médico
    responsável/médico-do-trabalho vinculado — a segregação de acesso por
    papel é o núcleo do produto (ver agents/claude.md)."""

    queryset = RegistroSaude.objects.all()
    serializer_class = RegistroSaudeSerializer
    permission_classes = [IsAuthenticated]


class RegraVerificacaoViewSet(viewsets.ModelViewSet):
    queryset = RegraVerificacao.objects.all()
    serializer_class = RegraVerificacaoSerializer
    permission_classes = [IsAuthenticated]
