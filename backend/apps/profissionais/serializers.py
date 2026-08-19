from rest_framework import serializers

from .models import Profissional


class ProfissionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profissional
        fields = ["id", "usuario", "especialidade", "registro_profissional", "registro_verificado"]
        read_only_fields = ["id", "registro_verificado"]
