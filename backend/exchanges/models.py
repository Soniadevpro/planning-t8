from django.db import models

# Create your models here.


from django.db import models
from django.utils import timezone
from accounts.models import CustomUser
from planning_app.models import Planning


class DemandeEchange(models.Model):
    """
    Modèle pour gérer les demandes d'échange entre agents
    """
    STATUT_CHOICES = [
        ('en_attente', 'En attente de réponse'),
        ('accepte_agent', 'Accepté par l\'agent'),
        ('refuse_agent', 'Refusé par l\'agent'),
        ('valide_superviseur', 'Validé par le superviseur'),
        ('refuse_superviseur', 'Refusé par le superviseur'),
        ('annule', 'Annulé'),
    ]
    
    # Qui demande l'échange
    demandeur = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='demandes_envoyees',
        verbose_name="Demandeur"
    )
    
    # À qui on demande l'échange
    destinataire = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='demandes_recues',
        verbose_name="Destinataire"
    )
    
    # Planning que le demandeur veut échanger
    planning_demandeur = models.ForeignKey(
        Planning,
        on_delete=models.CASCADE,
        related_name='demandes_echange_demandeur',
        verbose_name="Planning du demandeur"
    )
    
    # Planning que le destinataire possède et que veut le demandeur
    planning_destinataire = models.ForeignKey(
        Planning,
        on_delete=models.CASCADE,
        related_name='demandes_echange_destinataire',
        verbose_name="Planning du destinataire"
    )
    
    # Statut de la demande
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente',
        verbose_name="Statut"
    )
    
    # Messages et commentaires
    message_demandeur = models.TextField(
        blank=True,
        null=True,
        verbose_name="Message du demandeur",
        help_text="Raison de la demande d'échange"
    )
    
    commentaire_destinataire = models.TextField(
        blank=True,
        null=True,
        verbose_name="Commentaire du destinataire"
    )
    
    commentaire_superviseur = models.TextField(
        blank=True,
        null=True,
        verbose_name="Commentaire du superviseur"
    )
    
    # Qui a validé/refusé
    superviseur = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandes_traitees',
        verbose_name="Superviseur"
    )
    
    # Dates importantes
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    date_reponse_agent = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date réponse agent"
    )
    
    date_decision_superviseur = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date décision superviseur"
    )
    
    class Meta:
        verbose_name = "Demande d'échange"
        verbose_name_plural = "Demandes d'échange"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.demandeur.full_name} ↔ {self.destinataire.full_name} - {self.get_statut_display()}"
    
    @property
    def est_en_attente(self):
        return self.statut == 'en_attente'
    
    @property
    def est_accepte_agent(self):
        return self.statut == 'accepte_agent'
    
    @property
    def est_valide(self):
        return self.statut == 'valide_superviseur'
    
    @property
    def est_refuse(self):
        return self.statut in ['refuse_agent', 'refuse_superviseur']
    
    @property
    def peut_etre_accepte_par_agent(self):
        """Vérifie si l'agent peut encore accepter la demande"""
        return self.statut == 'en_attente'
    
    @property
    def peut_etre_valide_par_superviseur(self):
        """Vérifie si le superviseur peut valider la demande"""
        return self.statut == 'accepte_agent'
    
    def accepter_par_agent(self, user=None):
        """Accepte la demande côté agent"""
        if self.peut_etre_accepte_par_agent:
            self.statut = 'accepte_agent'
            self.date_reponse_agent = timezone.now()
            self.save()
    
    def refuser_par_agent(self, commentaire="", user=None):
        """Refuse la demande côté agent"""
        if self.peut_etre_accepte_par_agent:
            self.statut = 'refuse_agent'
            self.date_reponse_agent = timezone.now()
            if commentaire:
                self.commentaire_destinataire = commentaire
            self.save()
    
    def valider_par_superviseur(self, superviseur, commentaire=""):
        """Valide la demande côté superviseur et effectue l'échange"""
        if self.peut_etre_valide_par_superviseur:
            self.statut = 'valide_superviseur'
            self.date_decision_superviseur = timezone.now()
            self.superviseur = superviseur
            if commentaire:
                self.commentaire_superviseur = commentaire
            
            # Effectuer l'échange des plannings
            self._effectuer_echange()
            self.save()
    
    def refuser_par_superviseur(self, superviseur, commentaire=""):
        """Refuse la demande côté superviseur"""
        if self.peut_etre_valide_par_superviseur:
            self.statut = 'refuse_superviseur'
            self.date_decision_superviseur = timezone.now()
            self.superviseur = superviseur
            if commentaire:
                self.commentaire_superviseur = commentaire
            self.save()
    
    def _effectuer_echange(self):
        """Effectue l'échange des plannings"""
        # Échanger les agents sur les plannings
        agent_demandeur = self.planning_demandeur.agent
        agent_destinataire = self.planning_destinataire.agent
        
        self.planning_demandeur.agent = agent_destinataire
        self.planning_destinataire.agent = agent_demandeur
        
        self.planning_demandeur.save()
        self.planning_destinataire.save()


class HistoriqueEchange(models.Model):
    """
    Historique des actions sur les demandes d'échange
    """
    demande = models.ForeignKey(
        DemandeEchange,
        on_delete=models.CASCADE,
        related_name='historique'
    )
    
    action = models.CharField(max_length=50)
    utilisateur = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    commentaire = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.action} - {self.utilisateur} - {self.timestamp}"