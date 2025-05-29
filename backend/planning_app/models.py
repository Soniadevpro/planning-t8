from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from accounts.models import CustomUser


class Planning(models.Model):
    """
    Modèle pour gérer les créneaux de planning T8
    """
    TYPE_SERVICE_CHOICES = [
        ('matin', 'Service Matin'),
        ('apres_midi', 'Service Après-midi'),
        ('journee', 'Service Journée (8h45-16h30)'),
        ('nuit', 'Service Nuit'),
        ('repos', 'Repos'),
        ('vacances', 'Vacances'),
        ('jour_ferie_repos', 'Jour férié repos'),
    ]
    
    # Horaires prédéfinis par type de service
    HORAIRES_PREDEFINIS = {
        'matin': ('05:00', '13:00'),
        'apres_midi': ('13:00', '21:00'),
        'journee': ('08:45', '16:30'),
        'nuit': ('21:00', '05:00'),
        'repos': (None, None),
        'vacances': (None, None),
        'jour_ferie_repos': (None, None),
    }
    
    agent = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='plannings',
        verbose_name="Agent"
    )
    
    date = models.DateField(verbose_name="Date")
    
    type_service = models.CharField(
        max_length=20, 
        choices=TYPE_SERVICE_CHOICES,
        verbose_name="Type de service"
    )
    
    heure_debut = models.TimeField(
        blank=True, 
        null=True, 
        verbose_name="Heure de début"
    )
    
    heure_fin = models.TimeField(
        blank=True, 
        null=True, 
        verbose_name="Heure de fin"
    )
    
    # Informations complémentaires
    ligne = models.CharField(
        max_length=10, 
        default="T8", 
        verbose_name="Ligne"
    )
    
    notes = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Notes"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='plannings_created',
        verbose_name="Créé par"
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='plannings_updated',
        verbose_name="Modifié par"
    )
    
    class Meta:
        verbose_name = "Planning"
        verbose_name_plural = "Plannings"
        unique_together = ['agent', 'date']  # Un agent ne peut avoir qu'un seul créneau par jour
        ordering = ['date', 'agent__last_name']
    
    def __str__(self):
        return f"{self.agent.full_name} - {self.date} - {self.get_type_service_display()}"
    
    def save(self, *args, **kwargs):
        """Assigne automatiquement les horaires selon le type de service"""
        if self.type_service in self.HORAIRES_PREDEFINIS:
            debut, fin = self.HORAIRES_PREDEFINIS[self.type_service]
            if debut and fin:
                from datetime import time
                self.heure_debut = time.fromisoformat(debut)
                self.heure_fin = time.fromisoformat(fin)
            else:
                self.heure_debut = None
                self.heure_fin = None
        super().save(*args, **kwargs)
    
    @property
    def duree_service(self):
        """Calcule la durée du service en heures"""
        if self.heure_debut and self.heure_fin:
            debut = timezone.datetime.combine(self.date, self.heure_debut)
            fin = timezone.datetime.combine(self.date, self.heure_fin)
            if fin < debut:  # Service de nuit qui passe minuit
                fin += timezone.timedelta(days=1)
            return (fin - debut).total_seconds() / 3600
        return 0
    
    @property
    def est_jour_travaille(self):
        """Retourne True si c'est un jour travaillé"""
        return self.type_service not in ['repos', 'vacances', 'jour_ferie_repos']