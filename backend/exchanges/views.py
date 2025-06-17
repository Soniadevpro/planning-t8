from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from django.db import transaction 

from accounts.models import CustomUser
from accounts.serializers import CustomUserSerializer
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

        if hasattr(user, 'role') and user.role == 'agent':
            queryset = queryset.filter(
                Q(demandeur=user) | Q(destinataire=user)
            )
        elif hasattr(user, 'role') and user.role == 'superviseur':
            pass

        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset

    def create(self, request, *args, **kwargs):
        print(">>> Données POST reçues :", request.data)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            print(">>> Erreurs de validation :", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class DemandeEchangeDetailView(generics.RetrieveAPIView):
    queryset = DemandeEchange.objects.all()
    serializer_class = DemandeEchangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if hasattr(user, 'role') and user.role == 'agent':
            queryset = queryset.filter(
                Q(demandeur=user) | Q(destinataire=user)
            )

        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mes_demandes_envoyees(request):
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
    demandes = DemandeEchange.objects.filter(
        destinataire=request.user
    ).select_related(
        'demandeur', 'planning_demandeur', 'planning_destinataire', 'destinataire'
    ).order_by('-created_at')

    serializer = DemandeEchangeSerializer(demandes, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def repondre_demande(request, demande_id):
    try:
        demande = DemandeEchange.objects.get(id=demande_id, destinataire=request.user)
    except DemandeEchange.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    # Vérification basique du statut
    if demande.statut != 'en_attente':
        return Response({'error': 'Cette demande ne peut plus être modifiée'}, status=status.HTTP_400_BAD_REQUEST)

    action = request.data.get('action')
    commentaire = request.data.get('commentaire', '')

    if action == 'accepter':
        demande.statut = 'accepte_agent'
        demande.commentaire_destinataire = commentaire
        demande.date_reponse_agent = timezone.now()
        message = 'Demande acceptée avec succès'
    elif action == 'refuser':
        demande.statut = 'refuse_agent'
        demande.commentaire_destinataire = commentaire
        demande.date_reponse_agent = timezone.now()
        message = 'Demande refusée'
    else:
        return Response({'error': 'Action invalide'}, status=status.HTTP_400_BAD_REQUEST)

    demande.save()

    # Créer un historique
    try:
        HistoriqueEchange.objects.create(
            demande=demande,
            action=f'Demande {action}ée par l\'agent',
            utilisateur=request.user,
            commentaire=commentaire or None
        )
    except:
        pass

    return Response({
        'message': message,
        'demande': DemandeEchangeSerializer(demande).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def demandes_a_traiter(request):
    """Retourne les demandes à traiter selon le rôle de l'utilisateur"""
    user = request.user
    
    try:
        if hasattr(user, 'role') and user.role == 'agent':
            # Demandes reçues par l'agent en attente de sa réponse
            demandes = DemandeEchange.objects.filter(
                destinataire=user,
                statut='en_attente'
            ).select_related('demandeur', 'destinataire')
            
        elif hasattr(user, 'role') and user.role == 'superviseur':
            # Demandes acceptées par l'agent, en attente de validation superviseur
            demandes = DemandeEchange.objects.filter(
                statut='accepte_agent'
            ).select_related('demandeur', 'destinataire', 'planning_demandeur', 'planning_destinataire')
            
        else:
            demandes = DemandeEchange.objects.none()

        # Sérialiser les données
        data = []
        for demande in demandes:
            data.append({
                'id': demande.id,
                'demandeur_name': f"{demande.demandeur.first_name} {demande.demandeur.last_name}".strip() or demande.demandeur.username,
                'destinataire_name': f"{demande.destinataire.first_name} {demande.destinataire.last_name}".strip() or demande.destinataire.username,
                'date_demandeur': demande.planning_demandeur.date.strftime('%Y-%m-%d') if demande.planning_demandeur else None,
                'date_destinataire': demande.planning_destinataire.date.strftime('%Y-%m-%d') if demande.planning_destinataire else None,
                'type_service_demandeur': demande.planning_demandeur.type_service if demande.planning_demandeur else None,
                'type_service_destinataire': demande.planning_destinataire.type_service if demande.planning_destinataire else None,
                'statut': demande.statut,
                'created_at': demande.created_at.isoformat(),
                'message_demandeur': demande.message_demandeur,
            })

        print(f">>> Demandes trouvées pour {user.role} {user.username}: {len(data)}")
        return Response(data)
        
    except Exception as e:
        print(f">>> Erreur dans demandes_a_traiter: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def decision_superviseur(request, demande_id):
    """Validation ou refus par le superviseur avec échange réel des contenus de planning"""
    if not (hasattr(request.user, 'role') and request.user.role == 'superviseur'):
        return Response({'error': 'Seuls les superviseurs peuvent valider les demandes'}, status=status.HTTP_403_FORBIDDEN)

    try:
        demande = DemandeEchange.objects.get(id=demande_id)
    except DemandeEchange.DoesNotExist:
        return Response({'error': 'Demande non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    if demande.statut != 'accepte_agent':
        return Response({'error': 'Cette demande ne peut pas être validée'}, status=status.HTTP_400_BAD_REQUEST)

    action = request.data.get('action')
    commentaire = request.data.get('commentaire', '')

    try:
        if action == 'valider':
            # 🔄 ÉCHANGE RÉEL DU CONTENU DES PLANNINGS
            planning_demandeur = demande.planning_demandeur
            planning_destinataire = demande.planning_destinataire
            
            print(f">>> AVANT échange:")
            print(f"    Planning {planning_demandeur.id}: Agent {planning_demandeur.agent.username}, Service: {planning_demandeur.type_service}")
            print(f"    Planning {planning_destinataire.id}: Agent {planning_destinataire.agent.username}, Service: {planning_destinataire.type_service}")
            
            # Vérification de sécurité
            if planning_demandeur.agent != demande.demandeur:
                return Response({'error': 'Incohérence: le planning demandeur n\'appartient pas au bon agent'}, status=status.HTTP_400_BAD_REQUEST)
            
            if planning_destinataire.agent != demande.destinataire:
                return Response({'error': 'Incohérence: le planning destinataire n\'appartient pas au bon agent'}, status=status.HTTP_400_BAD_REQUEST)
            
            # 🔄 ÉCHANGER LE CONTENU DES PLANNINGS (pas les agents)
            with transaction.atomic():
                # Sauvegarder les contenus du planning demandeur
                temp_type_service = planning_demandeur.type_service
                temp_horaire_debut = getattr(planning_demandeur, 'horaire_debut', None)
                temp_horaire_fin = getattr(planning_demandeur, 'horaire_fin', None)
                temp_poste = getattr(planning_demandeur, 'poste', None)
                temp_description = getattr(planning_demandeur, 'description', None)
                
                # Échanger les contenus
                planning_demandeur.type_service = planning_destinataire.type_service
                if hasattr(planning_demandeur, 'horaire_debut'):
                    planning_demandeur.horaire_debut = getattr(planning_destinataire, 'horaire_debut', None)
                if hasattr(planning_demandeur, 'horaire_fin'):
                    planning_demandeur.horaire_fin = getattr(planning_destinataire, 'horaire_fin', None)
                if hasattr(planning_demandeur, 'poste'):
                    planning_demandeur.poste = getattr(planning_destinataire, 'poste', None)
                if hasattr(planning_demandeur, 'description'):
                    planning_demandeur.description = getattr(planning_destinataire, 'description', None)
                
                # Affecter les anciens contenus du demandeur au destinataire
                planning_destinataire.type_service = temp_type_service
                if hasattr(planning_destinataire, 'horaire_debut'):
                    planning_destinataire.horaire_debut = temp_horaire_debut
                if hasattr(planning_destinataire, 'horaire_fin'):
                    planning_destinataire.horaire_fin = temp_horaire_fin
                if hasattr(planning_destinataire, 'poste'):
                    planning_destinataire.poste = temp_poste
                if hasattr(planning_destinataire, 'description'):
                    planning_destinataire.description = temp_description
                
                # Sauvegarder les plannings modifiés
                planning_demandeur.save()
                planning_destinataire.save()
                
                # Mettre à jour le statut de la demande
                demande.statut = 'valide_superviseur'
                demande.commentaire_superviseur = commentaire
                demande.superviseur = request.user
                demande.date_decision_superviseur = timezone.now()
                demande.save()
            
            print(f">>> APRÈS échange:")
            print(f"    Planning {planning_demandeur.id}: Agent {planning_demandeur.agent.username}, Service: {planning_demandeur.type_service}")
            print(f"    Planning {planning_destinataire.id}: Agent {planning_destinataire.agent.username}, Service: {planning_destinataire.type_service}")
            
            message = f'✅ Échange validé et effectué avec succès ! Les services ont été échangés entre {demande.demandeur.username} et {demande.destinataire.username}.'
            
        elif action == 'refuser':
            # Pas d'échange, juste refus
            demande.statut = 'refuse_superviseur'
            demande.commentaire_superviseur = commentaire
            demande.superviseur = request.user
            demande.date_decision_superviseur = timezone.now()
            demande.save()
            
            message = '❌ Demande refusée par le superviseur. Aucun échange effectué.'
            
        else:
            return Response({'error': 'Action invalide'}, status=status.HTTP_400_BAD_REQUEST)

        # Créer un historique
        try:
            HistoriqueEchange.objects.create(
                demande=demande,
                action=f'Demande {action}ée par le superviseur - {"Échange effectué" if action == "valider" else "Échange annulé"}',
                utilisateur=request.user,
                commentaire=commentaire or None
            )
        except:
            pass  # Si le modèle n'existe pas encore

        # Retourner la demande mise à jour
        return Response({
            'message': message,
            'demande': DemandeEchangeSerializer(demande).data,
            'echange_effectue': action == 'valider'  # Indique si l'échange a été fait
        })

    except Exception as e:
        print(f"❌ Erreur lors de la décision superviseur: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Erreur lors de l\'échange: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def statistiques_echanges(request):
    date_debut = request.query_params.get('date_debut')
    date_fin = request.query_params.get('date_fin')

    queryset = DemandeEchange.objects.all()

    if date_debut:
        queryset = queryset.filter(created_at__gte=date_debut)
    if date_fin:
        queryset = queryset.filter(created_at__lte=date_fin)

    total_demandes = queryset.count()
    demandes_par_statut = dict(
        queryset.values('statut').annotate(count=Count('statut')).values_list('statut', 'count')
    )

    demandes_en_attente = queryset.filter(statut='en_attente').count()
    demandes_validees = queryset.filter(statut='valide_superviseur').count()

    demandes_traitees = queryset.exclude(statut='en_attente').count()
    taux_acceptation = (demandes_validees / demandes_traitees * 100) if demandes_traitees > 0 else 0

    # Gestion sécurisée des choix de statut
    try:
        statuts_libelles = dict(DemandeEchange.STATUT_CHOICES)
        demandes_par_statut_libelles = {
            statuts_libelles.get(k, k): v for k, v in demandes_par_statut.items()
        }
    except:
        demandes_par_statut_libelles = demandes_par_statut

    data = {
        'total_demandes': total_demandes,
        'demandes_par_statut': demandes_par_statut_libelles,
        'demandes_en_attente': demandes_en_attente,
        'demandes_validees': demandes_validees,
        'taux_acceptation': round(taux_acceptation, 1),
        'periode': f"{date_debut or 'début'} au {date_fin or 'maintenant'}"
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agents(request):
    """Retourne la liste des agents actifs (hors user actuel)"""
    try:
        # Récupération de tous les utilisateurs actifs (sauf l'utilisateur courant)
        agents = CustomUser.objects.filter(
            is_active=True
        ).exclude(id=request.user.id)
        
        # Si vous avez des champs role et is_active_agent, filtrer sur les agents
        if hasattr(CustomUser, 'role'):
            agents = agents.filter(role='agent')
        
        # Sérialisation manuelle robuste
        data = []
        for agent in agents:
            agent_data = {
                'id': agent.id,
                'first_name': agent.first_name or '',
                'last_name': agent.last_name or '',
                'email': agent.email or '',
                'username': agent.username or '',
            }
            
            # Calcul du nom complet
            if agent.first_name and agent.last_name:
                agent_data['full_name'] = f"{agent.first_name} {agent.last_name}".strip()
            elif agent.first_name:
                agent_data['full_name'] = agent.first_name
            elif agent.last_name:
                agent_data['full_name'] = agent.last_name
            else:
                agent_data['full_name'] = agent.username or agent.email or f"Utilisateur {agent.id}"
            
            data.append(agent_data)
        
        return Response(data)
        
    except Exception as e:
        print(f"Erreur dans get_agents: {e}")
        return Response(
            {'error': 'Erreur lors de la récupération des agents'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_plannings(request):
    """Retourne la liste des plannings d'un agent"""
    agent_id = request.query_params.get('agent')
    
    if not agent_id:
        return Response({'error': 'Paramètre agent requis'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Import dynamique pour éviter les erreurs de dépendance circulaire
        from planning_app.models import Planning
        
        plannings = Planning.objects.filter(agent_id=agent_id)
        
        # Sérialisation manuelle
        data = []
        for planning in plannings:
            data.append({
                'id': planning.id,
                'date': planning.date.strftime('%Y-%m-%d'),
                'type_service': planning.type_service,
                'horaire_debut': planning.horaire_debut.strftime('%H:%M') if hasattr(planning, 'horaire_debut') and planning.horaire_debut else None,
                'horaire_fin': planning.horaire_fin.strftime('%H:%M') if hasattr(planning, 'horaire_fin') and planning.horaire_fin else None,
                'poste': getattr(planning, 'poste', None),
                'agent_id': planning.agent.id,
            })
        
        return Response(data)
        
    except Exception as e:
        print(f"Erreur dans get_plannings: {e}")
        return Response(
            {'error': 'Erreur lors de la récupération des plannings'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )