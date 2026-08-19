from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Profissional
from .serializers import ProfissionalSerializer


class ProfissionalViewSet(viewsets.ModelViewSet):
    queryset = Profissional.objects.all()
    serializer_class = ProfissionalSerializer
    permission_classes = [IsAuthenticated]
