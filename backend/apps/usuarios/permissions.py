from rest_framework.permissions import BasePermission

from apps.usuarios.models import Papel


class TemPapel(BasePermission):
    """Permite acesso apenas a usuários autenticados com um dos papéis em
    `papeis_permitidos`. Subclassear por endpoint em vez de checar `request.user.papel`
    diretamente nas views — mantém a regra de autorização num único lugar auditável.
    """

    papeis_permitidos: tuple[str, ...] = ()

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.papel in self.papeis_permitidos
        )


class EhGerente(TemPapel):
    papeis_permitidos = (Papel.GERENTE,)


class EhMedicoOuMedicoDoTrabalho(TemPapel):
    papeis_permitidos = (Papel.MEDICO, Papel.MEDICO_DO_TRABALHO)


class EhEducadorFisico(TemPapel):
    papeis_permitidos = (Papel.EDUCADOR_FISICO,)
