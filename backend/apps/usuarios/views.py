from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Usuario
from .serializers import UsuarioSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    """CRUD do usuário autenticado.

    TODO: restringir `get_queryset` a `self.request.user` (um usuário não deve
    listar outros usuários) exceto para staff/admin — ainda não implementado.
    """

    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
