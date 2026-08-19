from django.db import models

from apps.core.models import ModeloComTimestamp
from apps.usuarios.models import Papel, Usuario


class Instituicao(ModeloComTimestamp):
    """Empresa/corporação parceira.

    Auto-referenciada (`instituicao_pai`) para suportar hierarquia multinível
    (ex: Batalhão > Companhia > Pelotão) desde já — decisão registrada em
    agents/claude.md para não bloquear o desenvolvimento enquanto o piloto
    institucional (Polícia Militar) confirma se precisa de múltiplos níveis.
    """

    nome = models.CharField(max_length=255)
    instituicao_pai = models.ForeignKey(
        "self", null=True, blank=True, related_name="subunidades", on_delete=models.CASCADE
    )

    def __str__(self):
        return self.nome


class VinculoInstituicao(ModeloComTimestamp):
    """Vincula um Usuario a uma Instituicao com um papel institucional."""

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="vinculos_institucionais")
    instituicao = models.ForeignKey(Instituicao, on_delete=models.CASCADE, related_name="vinculos")
    papel = models.CharField(max_length=30, choices=Papel.choices)

    class Meta:
        unique_together = ("usuario", "instituicao")

    def __str__(self):
        return f"{self.usuario} @ {self.instituicao} ({self.papel})"
