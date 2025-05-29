from rest_framework import serializers
from .models import DemandeEchange, HistoriqueEchange
from accounts.serializers import CustomUserSerializer
from planning_app.serializers import PlanningSerializer


class DemandeEchangeSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les demandes d'échange avec détails complets"""
    demandeur_info = CustomUserSerializer(source='demandeur', read_only=True)
    destinataire_info = CustomUserSerializer(source='destinataire', read_only=True)
    planning_demandeur_info = PlanningSerializer(source='planning_demandeur', read_only=True)
    planning_destinataire_info = PlanningSerializer(source='planning_destinataire', read_only=True)
    superviseur_info = CustomUserSerializer(source='superviseur', read_only=True)
    
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    # Propriétés calculées
    est_en_attente = serializers.ReadOnlyField()
    est_accepte_agent = serializers.ReadOnlyField()
    est_valide = serializers.ReadOnlyField()
    est_refuse = serializers.ReadOnlyField()
    peut_etre_accepte_par_agent = serializers.ReadOnlyField()
    peut_etre_valide_par_superviseur = serializers.ReadOnlyField()
    
    class Meta:
        model = DemandeEchange
        fields = [
            'id', 'demandeur', 'demandeur_info', 'destinataire', 'destinataire_info',
            'planning_demandeur', 'planning_demandeur_info',
            'planning_destinataire', 'planning_destinataire_info',
            'statut', 'statut_display', 'message_demandeur', 
            'commentaire_destinataire', 'commentaire_superviseur',
            'superviseur', 'superviseur_info', 'created_at', 'updated_at',
            'date_reponse_agent', 'date_decision_superviseur',
            'est_en_attente', 'est_accepte_agent', 'est_valide', 'est_refuse',
            'peut_etre_accepte_par_agent', 'peut_etre_valide_par_superviseur'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'date_reponse_agent', 
            'date_decision_superviseur', 'superviseur'
        ]


class DemandeEchangeCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour créer une demande d'échange"""
    
    class Meta:
        model = DemandeEchange
        fields = [
            'destinataire', 'planning_demandeur', 'planning_destinataire', 'message_demandeur'
        ]
    
    def validate(self, data):
        request = self.context['request']
        demandeur = request.user
        
        # Vérifier que le demandeur ne s'envoie pas une demande à lui-même
        if demandeur == data['destinataire']:
            raise serializers.ValidationError("Vous ne pouvez pas vous envoyer une demande à vous-même.")
        
        # Vérifier que le planning_demandeur appartient bien au demandeur
        if data['planning_demandeur'].agent != demandeur:
            raise serializers.ValidationError("Vous ne pouvez échanger que vos propres plannings.")
        
        # Vérifier que le planning_destinataire appartient bien au destinataire
        if data['planning_destinataire'].agent != data['destinataire']:
            raise serializers.ValidationError("Le planning sélectionné n'appartient pas au destinataire.")
        
        # Vérifier qu'il n'y a pas déjà une demande en cours pour ces plannings
        existing_demande = DemandeEchange.objects.filter(
            planning_demandeur=data['planning_demandeur'],
            planning_destinataire=data['planning_destinataire'],
            statut__in=['en_attente', 'accepte_agent']
        ).first()
        
        if existing_demande:
            raise serializers.ValidationError("Une demande d'échange est déjà en cours pour ces plannings.")
        
        return data
    
    def create(self, validated_data):
        validated_data['demandeur'] = self.context['request'].user
        return super().create(validated_data)


class DemandeEchangeListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour la liste des demandes"""
    demandeur_name = serializers.CharField(source='demandeur.full_name', read_only=True)
    destinataire_name = serializers.CharField(source='destinataire.full_name', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    date_demandeur = serializers.DateField(source='planning_demandeur.date', read_only=True)
    date_destinataire = serializers.DateField(source='planning_destinataire.date', read_only=True)
    
    type_service_demandeur = serializers.CharField(
        source='planning_demandeur.get_type_service_display', read_only=True
    )
    type_service_destinataire = serializers.CharField(
        source='planning_destinataire.get_type_service_display', read_only=True
    )
    
    class Meta:
        model = DemandeEchange
        fields = [
            'id', 'demandeur_name', 'destinataire_name', 'statut', 'statut_display',
            'date_demandeur', 'date_destinataire', 
            'type_service_demandeur', 'type_service_destinataire',
            'created_at', 'peut_etre_accepte_par_agent', 'peut_etre_valide_par_superviseur'
        ]


class ReponseAgentSerializer(serializers.Serializer):
    """Sérialiseur pour la réponse d'un agent (accepter/refuser)"""
    action = serializers.ChoiceField(choices=['accepter', 'refuser'])
    commentaire = serializers.CharField(required=False, allow_blank=True)


class DecisionSuperviseurSerializer(serializers.Serializer):
    """Sérialiseur pour la décision du superviseur (valider/refuser)"""
    action = serializers.ChoiceField(choices=['valider', 'refuser'])
    commentaire = serializers.CharField(required=False, allow_blank=True)


class HistoriqueEchangeSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'historique des échanges"""
    utilisateur_info = CustomUserSerializer(source='utilisateur', read_only=True)
    
    class Meta:
        model = HistoriqueEchange
        fields = ['id', 'action', 'utilisateur', 'utilisateur_info', 'commentaire', 'timestamp']


class StatistiquesEchangeSerializer(serializers.Serializer):
    """Sérialiseur pour les statistiques d'échange"""
    total_demandes = serializers.IntegerField()
    demandes_par_statut = serializers.DictField()
    demandes_en_attente = serializers.IntegerField()
    demandes_validees = serializers.IntegerField()
    taux_acceptation = serializers.FloatField()
    periode = serializers.CharField()