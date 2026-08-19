from django.db import models


class ModeloComTimestamp(models.Model):
    """Mixin abstrato com campos de auditoria de criação/atualização."""

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
