from rest_framework import serializers

from .models import Atendimento, Solicitacao, VinculoCuidado


class SolicitacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitacao
        fields = ["id", "usuario", "especialidade", "status"]
        read_only_fields = ["id", "status"]


class AtendimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atendimento
        fields = ["id", "solicitacao", "profissional"]
        read_only_fields = ["id"]


class VinculoCuidadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VinculoCuidado
        fields = ["id", "usuario", "profissional", "ativo"]
        read_only_fields = ["id"]
