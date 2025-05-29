from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'full_name', 'role', 'matricule', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'date_embauche', 'date_joined']
    search_fields = ['username', 'first_name', 'last_name', 'matricule', 'email']
    
    # Ajout des champs personnalisés dans les formulaires
    fieldsets = UserAdmin.fieldsets + (
        ('Informations T8', {
            'fields': ('role', 'matricule', 'telephone', 'date_embauche', 'is_active_agent')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informations T8', {
            'fields': ('role', 'matricule', 'telephone', 'date_embauche')
        }),
    )