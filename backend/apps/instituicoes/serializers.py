from rest_framework import serializers

from .models import Instituicao, VinculoInstituicao


class InstituicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instituicao
        fields = ["id", "nome", "instituicao_pai"]
        read_only_fields = ["id"]


class VinculoInstituicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VinculoInstituicao
        fields = ["id", "usuario", "instituicao", "papel"]
        read_only_fields = ["id"]
