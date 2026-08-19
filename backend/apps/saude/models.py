from django.db import models

from apps.core.models import ModeloComTimestamp
from apps.usuarios.models import Usuario


class TipoExame(models.TextChoices):
    LABORATORIAL = "laboratorial", "Exame laboratorial"
    CARDIOLOGICO = "cardiologico", "Avaliação cardiológica"
    BIOIMPEDANCIA = "bioimpedancia", "Bioimpedância"
    DESEMPENHO_FISICO = "desempenho_fisico", "Desempenho físico"


class RegistroSaude(ModeloComTimestamp):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="registros_saude")
    tipo = models.CharField(max_length=30, choices=TipoExame.choices)
    indice = models.CharField(max_length=100)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateField()

    def __str__(self):
        return f"{self.usuario} — {self.indice} ({self.data})"


class RegraVerificacao(ModeloComTimestamp):
    """Faixa de referência clínica usada na verificação automática.

    Versionada no banco (não hardcoded no código) — decisão registrada em
    "Regras de Design" em agents/claude.md, para permitir correção rápida se
    uma faixa estiver incorreta, sem precisar de deploy.
    """

    tipo = models.CharField(max_length=30, choices=TipoExame.choices)
    indice = models.CharField(max_length=100)
    valor_minimo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_maximo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    fonte = models.CharField(max_length=255, help_text="Fonte rastreável da faixa (ex: Ministério da Saúde)")

    def __str__(self):
        return f"{self.indice} ({self.valor_minimo}–{self.valor_maximo})"
