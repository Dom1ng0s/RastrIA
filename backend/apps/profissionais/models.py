from django.db import models

from apps.core.models import ModeloComTimestamp
from apps.usuarios.models import Usuario


class Especialidade(models.TextChoices):
    MEDICO = "medico", "Médico"
    EDUCADOR_FISICO = "educador_fisico", "Educador físico"


class Profissional(ModeloComTimestamp):
    """Membro da rede pré-qualificada. Registro profissional (CRM ou CREF)
    hoje verificado manualmente pela equipe — ver "Escopo do MVP" em
    agents/claude.md."""

    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name="perfil_profissional")
    especialidade = models.CharField(max_length=20, choices=Especialidade.choices)
    registro_profissional = models.CharField(max_length=50, help_text="CRM ou CREF")
    registro_verificado = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.usuario} ({self.registro_profissional})"
