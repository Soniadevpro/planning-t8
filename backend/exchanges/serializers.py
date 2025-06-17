from rest_framework import serializers
from .models import DemandeEchange, HistoriqueEchange
from accounts.serializers import CustomUserSerializer
from planning_app.serializers import PlanningSerializer


class DemandeEchangeSerializer(serializers.ModelSerializer):
    demandeur_info = CustomUserSerializer(source='demandeur', read_only=True)
    destinataire_info = CustomUserSerializer(source='destinataire', read_only=True)
    planning_demandeur_info = PlanningSerializer(source='planning_demandeur', read_only=True)
    planning_destinataire_info = PlanningSerializer(source='planning_destinataire', read_only=True)
    superviseur_info = CustomUserSerializer(source='superviseur', read_only=True)

    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

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
    class Meta:
        model = DemandeEchange
        fields = ['destinataire', 'planning_demandeur', 'planning_destinataire', 'message_demandeur']

    def validate(self, data):
        request = self.context['request']
        demandeur = request.user

        planning_demandeur = data.get('planning_demandeur')
        planning_destinataire = data.get('planning_destinataire')
        destinataire = data.get('destinataire')

        # Debug simple pour repérer les erreurs
        print(">>> VALIDATION")
        print("Demandeur :", demandeur)
        print("Destinataire :", destinataire)
        print("Planning Demandeur.agent :", getattr(planning_demandeur, 'agent', None))
        print("Planning Destinataire.agent :", getattr(planning_destinataire, 'agent', None))

        if demandeur == destinataire:
            raise serializers.ValidationError("Vous ne pouvez pas vous envoyer une demande à vous-même.")

        if planning_demandeur.agent != demandeur:
            raise serializers.ValidationError("Vous ne pouvez échanger que vos propres plannings.")

        if planning_destinataire.agent != destinataire:
            raise serializers.ValidationError("Le planning sélectionné n'appartient pas au destinataire.")

        # Vérifier si une demande identique est déjà en attente ou en cours
        existing = DemandeEchange.objects.filter(
            planning_demandeur=planning_demandeur,
            planning_destinataire=planning_destinataire,
            statut__in=['en_attente', 'accepte_agent']
        ).exists()
        if existing:
            raise serializers.ValidationError("Une demande d'échange est déjà en cours pour ces plannings.")

        return data

    def create(self, validated_data):
        validated_data['demandeur'] = self.context['request'].user
        return super().create(validated_data)


class DemandeEchangeListSerializer(serializers.ModelSerializer):
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
    action = serializers.ChoiceField(choices=['accepter', 'refuser'])
    commentaire = serializers.CharField(required=False, allow_blank=True)


class DecisionSuperviseurSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['valider', 'refuser'])
    commentaire = serializers.CharField(required=False, allow_blank=True)


class HistoriqueEchangeSerializer(serializers.ModelSerializer):
    utilisateur_info = CustomUserSerializer(source='utilisateur', read_only=True)

    class Meta:
        model = HistoriqueEchange
        fields = ['id', 'action', 'utilisateur', 'utilisateur_info', 'commentaire', 'timestamp']


class StatistiquesEchangeSerializer(serializers.Serializer):
    total_demandes = serializers.IntegerField()
    demandes_par_statut = serializers.DictField()
    demandes_en_attente = serializers.IntegerField()
    demandes_validees = serializers.IntegerField()
    taux_acceptation = serializers.FloatField()
    periode = serializers.CharField()
