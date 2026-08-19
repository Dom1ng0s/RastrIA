from rest_framework import serializers

from .models import RegistroSaude, RegraVerificacao


class RegistroSaudeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroSaude
        fields = ["id", "usuario", "tipo", "indice", "valor", "data"]
        read_only_fields = ["id"]


class RegraVerificacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegraVerificacao
        fields = ["id", "tipo", "indice", "valor_minimo", "valor_maximo", "fonte"]
        read_only_fields = ["id"]
