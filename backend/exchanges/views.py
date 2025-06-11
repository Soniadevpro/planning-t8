from django.shortcuts import render

# Create your views here.

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import DemandeEchange, HistoriqueEchange
from .serializers import (
    DemandeEchangeSerializer,
    DemandeEchangeCreateSerializer,
    DemandeEchangeListSerializer,
    ReponseAgentSerializer,
    DecisionSuperviseurSerializer,
    HistoriqueEchangeSerializer,
    StatistiquesEchangeSerializer
)


class DemandeEchangeListCreateView(generics.ListCreateAPIView):
    """API pour lister et créer des demandes d'échange"""
    permission_classes = [permissions.IsAuthenticated]

    
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DemandeEchangeCreateSerializer
        return DemandeEchangeListSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = DemandeEchange.objects.select_related(
            'demandeur', 'destinataire', 'planning_demandeur', 'planning_destinataire'
        ).order_by('-created_at')
        
        # Filtrer selon le rôle
        if user.is_agent():
            # Les agents voient leurs demandes (envoyées et reçues)
            queryset = queryset.filter(
                Q(demandeur=user) | Q(destinataire=user)
            )
        elif user.is_superviseur():
            # Les superviseurs voient toutes les demandes
            pass
        
        # Filtres optionnels
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)
        
        return queryset


class DemandeEchangeDetailView(generics.RetrieveAPIView):
    """API pour récupérer le détail d'une demande d'échange"""
    queryset = DemandeEchange.objects.all()
    serializer_class = DemandeEchangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        if user.is_agent():
            # Les agents ne voient que leurs demandes
            queryset = queryset.filter(
                Q(demandeur=user) | Q(destinataire=user)
            )
        
        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mes_demandes_envoyees(request):
    """API pour récupérer les demandes envoyées par l'utilisateur"""
    demandes = DemandeEchange.objects.filter(
        demandeur=request.user
    ).select_related(
        'destinataire', 'planning_demandeur', 'planning_destinataire'
    ).order_by('-created_at')
    
    serializer = DemandeEchangeListSerializer(demandes, many=True)
    return Response(serializer.data)


@api_view(['GET']) 
@permission_classes([permissions.IsAuthenticated])
def mes_demandes_recues(request):
    """API pour récupérer les demandes reçues par l'utilisateur"""
    demandes = DemandeEchange.objects.filter(
        destinataire=request.user
    ).select_related(
        'demandeur', 'planning_demandeur', 'planning_destinataire', 'destinataire'  # Ajouter 'destinataire'
    ).order_by('-created_at')
    
    serializer = DemandeEchangeSerializer(demandes, many=True)  # Changer pour le serializer complet
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def repondre_demande(request, demande_id):
    """API pour qu'un agent réponde à une demande (accepter/refuser)"""
    try:
        demande = DemandeEchange.objects.get(id=demande_id, destinataire=request.user)
    except DemandeEchange.DoesNotExist:
        return Response(
            {'error': 'Demande non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not demande.peut_etre_accepte_par_agent:
        return Response(
            {'error': 'Cette demande ne peut plus être modifiée'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = ReponseAgentSerializer(data=request.data)
    if serializer.is_valid():
        action = serializer.validated_data['action']
        commentaire = serializer.validated_data.get('commentaire', '')
        
        if action == 'accepter':
            demande.accepter_par_agent(user=request.user)
            message = 'Demande acceptée avec succès'
        else:
            demande.refuser_par_agent(commentaire=commentaire, user=request.user)
            message = 'Demande refusée'
        
        # Créer un historique
        HistoriqueEchange.objects.create(
            demande=demande,
            action=f'Demande {action}ée par l\'agent',
            utilisateur=request.user,
            commentaire=commentaire or None
        )
        
        return Response({
            'message': message,
            'demande': DemandeEchangeSerializer(demande).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def decision_superviseur(request, demande_id):
    """API pour qu'un superviseur prenne une décision (valider/refuser)"""
    if not request.user.is_superviseur():
        return Response(
            {'error': 'Seuls les superviseurs peuvent valider les demandes'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        demande = DemandeEchange.objects.get(id=demande_id)
    except DemandeEchange.DoesNotExist:
        return Response(
            {'error': 'Demande non trouvée'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not demande.peut_etre_valide_par_superviseur:
        return Response(
            {'error': 'Cette demande ne peut pas être validée'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = DecisionSuperviseurSerializer(data=request.data)
    if serializer.is_valid():
        action = serializer.validated_data['action']
        commentaire = serializer.validated_data.get('commentaire', '')
        
        if action == 'valider':
            demande.valider_par_superviseur(
                superviseur=request.user, 
                commentaire=commentaire
            )
            message = 'Demande validée et échange effectué avec succès'
        else:
            demande.refuser_par_superviseur(
                superviseur=request.user, 
                commentaire=commentaire
            )
            message = 'Demande refusée par le superviseur'
        
        # Créer un historique
        HistoriqueEchange.objects.create(
            demande=demande,
            action=f'Demande {action}ée par le superviseur',
            utilisateur=request.user,
            commentaire=commentaire or None
        )
        
        return Response({
            'message': message,
            'demande': DemandeEchangeSerializer(demande).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def demandes_a_traiter(request):
    """API pour récupérer les demandes qui nécessitent une action"""
    user = request.user
    
    if user.is_agent():
        # Demandes reçues en attente de réponse
        demandes = DemandeEchange.objects.filter(
            destinataire=user,
            statut='en_attente'
        )
    elif user.is_superviseur():
        # Demandes acceptées par l'agent, en attente de validation
        demandes = DemandeEchange.objects.filter(
            statut='accepte_agent'
        )
    else:
        demandes = DemandeEchange.objects.none()
    
    serializer = DemandeEchangeListSerializer(demandes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def statistiques_echanges(request):
    """API pour les statistiques des échanges"""
    # Filtrer par période si spécifié
    date_debut = request.query_params.get('date_debut')
    date_fin = request.query_params.get('date_fin')
    
    queryset = DemandeEchange.objects.all()
    
    if date_debut:
        queryset = queryset.filter(created_at__gte=date_debut)
    if date_fin:
        queryset = queryset.filter(created_at__lte=date_fin)
    
    # Statistiques générales
    total_demandes = queryset.count()
    demandes_par_statut = dict(
        queryset.values('statut')
        .annotate(count=Count('statut'))
        .values_list('statut', 'count')
    )
    
    demandes_en_attente = queryset.filter(statut='en_attente').count()
    demandes_validees = queryset.filter(statut='valide_superviseur').count()
    
    # Taux d'acceptation
    demandes_traitees = queryset.exclude(statut='en_attente').count()
    taux_acceptation = (demandes_validees / demandes_traitees * 100) if demandes_traitees > 0 else 0
    
    # Convertir les statuts en libellés
    statuts_libelles = dict(DemandeEchange.STATUT_CHOICES)
    demandes_par_statut_libelles = {
        statuts_libelles.get(k, k): v for k, v in demandes_par_statut.items()
    }
    
    data = {
        'total_demandes': total_demandes,
        'demandes_par_statut': demandes_par_statut_libelles,
        'demandes_en_attente': demandes_en_attente,
        'demandes_validees': demandes_validees,
        'taux_acceptation': round(taux_acceptation, 1),
        'periode': f"{date_debut or 'début'} au {date_fin or 'maintenant'}"
    }
    
    serializer = StatistiquesEchangeSerializer(data)
    return Response(serializer.data)