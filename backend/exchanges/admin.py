from django.contrib import admin

# Register your models here.


from django.contrib import admin
from django.utils.html import format_html
from .models import DemandeEchange, HistoriqueEchange

@admin.register(DemandeEchange)
class DemandeEchangeAdmin(admin.ModelAdmin):
    list_display = [
        'demandeur_info',
        'destinataire_info', 
        'planning_dates',
        'statut_colored',
        'created_at',
        'actions_disponibles'
    ]
    
    list_filter = [
        'statut', 
        'created_at',
        'planning_demandeur__date',
        'planning_destinataire__date'
    ]
    
    search_fields = [
        'demandeur__first_name',
        'demandeur__last_name', 
        'destinataire__first_name',
        'destinataire__last_name',
        'message_demandeur'
    ]
    
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Demande d\'échange', {
            'fields': (
                'demandeur',
                'destinataire', 
                'planning_demandeur',
                'planning_destinataire',
                'message_demandeur'
            )
        }),
        ('Statut et réponses', {
            'fields': (
                'statut',
                'commentaire_destinataire',
                'commentaire_superviseur',
                'superviseur'
            )
        }),
        ('Dates', {
            'fields': (
                'created_at',
                'date_reponse_agent',
                'date_decision_superviseur'
            ),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = (
        'created_at', 
        'updated_at',
        'date_reponse_agent',
        'date_decision_superviseur'
    )
    
    def demandeur_info(self, obj):
        return f"{obj.demandeur.full_name} ({obj.demandeur.role})"
    demandeur_info.short_description = "Demandeur"
    
    def destinataire_info(self, obj):
        return f"{obj.destinataire.full_name} ({obj.destinataire.role})"
    destinataire_info.short_description = "Destinataire"
    
    def planning_dates(self, obj):
        return format_html(
            "<strong>{}</strong> ↔ <strong>{}</strong>",
            obj.planning_demandeur.date,
            obj.planning_destinataire.date
        )
    planning_dates.short_description = "Dates à échanger"
    
    def statut_colored(self, obj):
        colors = {
            'en_attente': '#ffc107',
            'accepte_agent': '#17a2b8', 
            'refuse_agent': '#dc3545',
            'valide_superviseur': '#28a745',
            'refuse_superviseur': '#dc3545',
            'annule': '#6c757d'
        }
        color = colors.get(obj.statut, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_statut_display()
        )
    statut_colored.short_description = "Statut"
    
    def actions_disponibles(self, obj):
        actions = []
        if obj.peut_etre_accepte_par_agent:
            actions.append("✋ Attente agent")
        if obj.peut_etre_valide_par_superviseur:
            actions.append("👨‍💼 Attente superviseur")
        if obj.est_valide:
            actions.append("✅ Échange effectué")
        return " | ".join(actions) if actions else "❌ Terminé"
    actions_disponibles.short_description = "Actions"

@admin.register(HistoriqueEchange)
class HistoriqueEchangeAdmin(admin.ModelAdmin):
    list_display = ['demande', 'action', 'utilisateur', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['demande__demandeur__last_name', 'action', 'commentaire']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False  # Pas de création manuelle d'historique