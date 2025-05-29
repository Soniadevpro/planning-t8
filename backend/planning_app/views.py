from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Planning
from .serializers import (
    PlanningSerializer, 
    PlanningCreateSerializer,
    PlanningListSerializer,
    PlanningCalendrierSerializer,
    StatistiquesPlanningSerializer
)


class PlanningListCreateView(generics.ListCreateAPIView):
    """API pour lister et créer des plannings"""
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PlanningCreateSerializer
        return PlanningListSerializer
    
    def get_queryset(self):
        queryset = Planning.objects.select_related('agent').order_by('-date', 'agent__last_name')
        
        # Filtres
        agent_id = self.request.query_params.get('agent', None)
        date_debut = self.request.query_params.get('date_debut', None)
        date_fin = self.request.query_params.get('date_fin', None)
        type_service = self.request.query_params.get('type_service', None)
        
        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)
        
        if date_debut:
            queryset = queryset.filter(date__gte=date_debut)
        
        if date_fin:
            queryset = queryset.filter(date__lte=date_fin)
            
        if type_service:
            queryset = queryset.filter(type_service=type_service)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PlanningDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API pour récupérer, modifier ou supprimer un planning"""
    queryset = Planning.objects.all()
    serializer_class = PlanningSerializer
    permission_classes = [permissions.AllowAny]
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def mes_plannings(request):
    """API pour récupérer les plannings de l'utilisateur connecté"""
    queryset = Planning.objects.filter(agent=request.user).order_by('-date')
    
    # Filtres optionnels
    date_debut = request.query_params.get('date_debut', None)
    date_fin = request.query_params.get('date_fin', None)
    
    if date_debut:
        queryset = queryset.filter(date__gte=date_debut)
    
    if date_fin:
        queryset = queryset.filter(date__lte=date_fin)
    
    serializer = PlanningSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def planning_calendrier(request):
    """API pour affichage calendrier par mois"""
    # Paramètres par défaut : mois actuel
    annee = int(request.query_params.get('annee', timezone.now().year))
    mois = int(request.query_params.get('mois', timezone.now().month))
    
    # Première et dernière date du mois
    debut_mois = datetime(annee, mois, 1).date()
    if mois == 12:
        fin_mois = datetime(annee + 1, 1, 1).date() - timedelta(days=1)
    else:
        fin_mois = datetime(annee, mois + 1, 1).date() - timedelta(days=1)
    
    # Récupérer tous les plannings du mois
    plannings = Planning.objects.filter(
        date__gte=debut_mois,
        date__lte=fin_mois
    ).select_related('agent').order_by('date', 'agent__last_name')
    
    # Grouper par date
    plannings_par_date = {}
    for planning in plannings:
        date_str = planning.date.strftime('%Y-%m-%d')
        if date_str not in plannings_par_date:
            plannings_par_date[date_str] = []
        plannings_par_date[date_str].append(planning)
    
    # Préparer la réponse
    calendrier_data = []
    current_date = debut_mois
    
    while current_date <= fin_mois:
        date_str = current_date.strftime('%Y-%m-%d')
        plannings_jour = plannings_par_date.get(date_str, [])
        
        # Statistiques du jour
        types_service = {}
        for planning in plannings_jour:
            type_service = planning.get_type_service_display()
            types_service[type_service] = types_service.get(type_service, 0) + 1
        
        calendrier_data.append({
            'date': current_date,
            'plannings': PlanningListSerializer(plannings_jour, many=True).data,
            'nombre_agents': len(plannings_jour),
            'types_service': types_service
        })
        
        current_date += timedelta(days=1)
    
    return Response({
        'calendrier': calendrier_data,
        'mois': mois,
        'annee': annee,
        'total_plannings': len(plannings)
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def statistiques_planning(request):
    """API pour les statistiques de planning"""
    # Période par défaut : mois actuel
    date_debut = request.query_params.get('date_debut')
    date_fin = request.query_params.get('date_fin')
    
    if not date_debut:
        debut_mois = timezone.now().replace(day=1).date()
        date_debut = debut_mois.strftime('%Y-%m-%d')
    
    if not date_fin:
        date_fin = timezone.now().date().strftime('%Y-%m-%d')
    
    queryset = Planning.objects.filter(date__gte=date_debut, date__lte=date_fin)
    
    # Statistiques générales
    total_plannings = queryset.count()
    agents_actifs = queryset.values('agent').distinct().count()
    heures_totales = sum([p.duree_service for p in queryset if p.duree_service])
    
    # Plannings par type de service
    plannings_par_type = dict(
        queryset.values('type_service')
        .annotate(count=Count('type_service'))
        .values_list('type_service', 'count')
    )
    
    # Convertir les clés en libellés lisibles
    types_libelles = dict(Planning.TYPE_SERVICE_CHOICES)
    plannings_par_type_libelles = {
        types_libelles.get(k, k): v for k, v in plannings_par_type.items()
    }
    
    data = {
        'total_plannings': total_plannings,
        'plannings_par_type': plannings_par_type_libelles,
        'agents_actifs': agents_actifs,
        'heures_totales': round(heures_totales, 1),
        'periode': f"{date_debut} au {date_fin}"
    }
    
    serializer = StatistiquesPlanningSerializer(data)
    return Response(serializer.data)