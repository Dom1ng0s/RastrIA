from django.db import models

from apps.core.models import ModeloComTimestamp
from apps.profissionais.models import Profissional
from apps.usuarios.models import Usuario


class StatusSolicitacao(models.TextChoices):
    PENDENTE = "pendente", "Pendente"
    CONFIRMADA = "confirmada", "Confirmada"
    RECUSADA = "recusada", "Recusada"


class Solicitacao(ModeloComTimestamp):
    """Pedido de acompanhamento.

    O fluxo é solicitação → confirmação do profissional, NUNCA aceite
    automático/instantâneo tipo "corrida" — essa escolha é deliberada para
    evitar o enquadramento do Parecer CFM nº 15/2026 como "ambiente médico
    virtual" pleno. Ver "Regras de Design" em agents/claude.md antes de mudar
    esse fluxo.
    """

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="solicitacoes")
    especialidade = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=StatusSolicitacao.choices, default=StatusSolicitacao.PENDENTE)

    def __str__(self):
        return f"Solicitação #{self.pk} ({self.status})"


class Atendimento(ModeloComTimestamp):
    solicitacao = models.OneToOneField(Solicitacao, on_delete=models.CASCADE, related_name="atendimento")
    profissional = models.ForeignKey(Profissional, on_delete=models.CASCADE, related_name="atendimentos")

    def __str__(self):
        return f"Atendimento #{self.pk}"


class VinculoCuidado(ModeloComTimestamp):
    """Continuidade de cuidado entre um usuário e um profissional — reforça
    que a conexão não é matching pontual, e sim uma relação continuada."""

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="vinculos_cuidado")
    profissional = models.ForeignKey(Profissional, on_delete=models.CASCADE, related_name="vinculos_cuidado")
    ativo = models.BooleanField(default=True)

    class Meta:
        unique_together = ("usuario", "profissional")
