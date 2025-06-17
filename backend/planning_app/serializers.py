from rest_framework import serializers
from .models import Planning
from accounts.serializers import CustomUserSerializer


class PlanningSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les plannings avec informations agent"""
    agent_info = CustomUserSerializer(source='agent', read_only=True)
    duree_service = serializers.ReadOnlyField()
    est_jour_travaille = serializers.ReadOnlyField()
    type_service_display = serializers.CharField(source='get_type_service_display', read_only=True)
    
    class Meta:
        model = Planning
        fields = [
            'id', 'agent', 'agent_info', 'date', 'type_service', 'type_service_display', 'poste',
            'heure_debut', 'heure_fin', 'ligne', 'notes', 
            'duree_service', 'est_jour_travaille', 
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']


class PlanningCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour créer un planning"""
    
    class Meta:
        model = Planning
        fields = ['agent', 'date', 'type_service','poste', 'notes']
    
    def validate(self, data):
        # Vérifier qu'un planning n'existe pas déjà pour cet agent à cette date
        agent = data.get('agent')
        date = data.get('date')
        
        if Planning.objects.filter(agent=agent, date=date).exists():
            raise serializers.ValidationError(
                f"Un planning existe déjà pour {agent.full_name} le {date}"
            )
        
        return data


class PlanningListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour la liste des plannings"""
    agent_name = serializers.CharField(source='agent.full_name', read_only=True)
    agent_matricule = serializers.CharField(source='agent.matricule', read_only=True)
    type_service_display = serializers.CharField(source='get_type_service_display', read_only=True)
    
    class Meta:
        model = Planning
        fields = [
            'id', 'agent', 'agent_name', 'agent_matricule',
            'date', 'type_service', 'type_service_display',
            'poste',
            'heure_debut', 'heure_fin', 'duree_service'
        ]


class PlanningCalendrierSerializer(serializers.Serializer):
    """Sérialiseur pour l'affichage calendrier"""
    date = serializers.DateField()
    plannings = PlanningListSerializer(many=True)
    nombre_agents = serializers.IntegerField()
    types_service = serializers.DictField()


class StatistiquesPlanningSerializer(serializers.Serializer):
    """Sérialiseur pour les statistiques de planning"""
    total_plannings = serializers.IntegerField()
    plannings_par_type = serializers.DictField()
    agents_actifs = serializers.IntegerField()
    heures_totales = serializers.FloatField()
    periode = serializers.CharField()