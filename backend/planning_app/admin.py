from django.contrib import admin

# Register your models here.


from django.contrib import admin
from .models import Planning

@admin.register(Planning)
class PlanningAdmin(admin.ModelAdmin):
    list_display = [
        'agent', 
        'date', 
        'type_service', 
        'heure_debut', 
        'heure_fin', 
        'duree_service',
        'created_by'
    ]
    
    list_filter = [
        'type_service', 
        'date', 
        'ligne',
        'agent__role'
    ]
    
    search_fields = [
        'agent__first_name', 
        'agent__last_name', 
        'agent__matricule',
        'notes'
    ]
    
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('agent', 'date', 'type_service')
        }),
        ('Horaires', {
            'fields': ('heure_debut', 'heure_fin'),
            'description': 'Les horaires se remplissent automatiquement selon le type de service'
        }),
        ('Détails', {
            'fields': ('ligne', 'notes'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Si c'est une création
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
    
    def duree_service(self, obj):
        """Affiche la durée du service"""
        return f"{obj.duree_service:.1f}h" if obj.duree_service else "-"
    duree_service.short_description = "Durée"