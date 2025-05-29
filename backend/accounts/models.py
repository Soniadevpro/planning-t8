from django.db import models

# Create your models here.


from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Modèle utilisateur personnalisé pour l'application Planning T8
    """
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('superviseur', 'Superviseur'),
        ('agent', 'Agent'),
    ]
    
    # Rôle de l'utilisateur
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='agent',
        verbose_name="Rôle"
    )
    
    # Informations personnelles
    telephone = models.CharField(
        max_length=15, 
        blank=True, 
        null=True,
        verbose_name="Téléphone"
    )
    
    matricule = models.CharField(
        max_length=20, 
        unique=True, 
        blank=True, 
        null=True,
        verbose_name="Matricule"
    )
    
    date_embauche = models.DateField(
        blank=True, 
        null=True,
        verbose_name="Date d'embauche"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_active_agent = models.BooleanField(
        default=True, 
        help_text="Agent actif dans les plannings"
    )
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.matricule or self.username})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_superviseur(self):
        return self.role == 'superviseur'
    
    def is_agent(self):
        return self.role == 'agent'
