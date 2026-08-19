from django.contrib import admin

from .models import Atendimento, Solicitacao, VinculoCuidado

admin.site.register(Solicitacao)
admin.site.register(Atendimento)
admin.site.register(VinculoCuidado)
