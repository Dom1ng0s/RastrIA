from django.contrib.auth.models import AbstractUser
from django.db import models


class Papel(models.TextChoices):
    """Papéis do domínio — ver "Domínio — Papéis e Acesso" em agents/claude.md.
    O papel determina o que o usuário enxerga; a segregação por papel é o
    núcleo do produto e não deve ser contornada por conveniência de feature.
    """

    INDIVIDUAL = "individual", "Usuário individual"
    MEDICO = "medico", "Médico"
    EDUCADOR_FISICO = "educador_fisico", "Educador físico"
    INTEGRANTE = "integrante", "Integrante (institucional)"
    MEDICO_DO_TRABALHO = "medico_do_trabalho", "Médico do trabalho"
    GERENTE = "gerente", "Gerente/Comandante"


class Usuario(AbstractUser):
    """User customizado do projeto (`AUTH_USER_MODEL`)."""

    papel = models.CharField(max_length=30, choices=Papel.choices, default=Papel.INDIVIDUAL)

    def set_password(self, raw_password):
        super().set_password(raw_password)
        self._senha_alterada = True

    def save(self, *args, **kwargs):
        senha_alterada = getattr(self, "_senha_alterada", False) and self.pk is not None
        super().save(*args, **kwargs)
        # Troca de senha (admin, changepassword, futuros endpoints da #178)
        # encerra todas as sessões abertas — issue #190.
        if senha_alterada:
            from apps.usuarios.autenticacao import revogar_tokens_do_usuario

            revogar_tokens_do_usuario(self)
        self._senha_alterada = False

    def __str__(self):
        return self.get_full_name() or self.username
