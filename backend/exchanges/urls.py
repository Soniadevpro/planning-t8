from django.urls import path
from . import views

urlpatterns = [
    # CRUD demandes d'échange
    path('echanges/', views.DemandeEchangeListCreateView.as_view(), name='api_echanges_list'),
    path('echanges/<int:pk>/', views.DemandeEchangeDetailView.as_view(), name='api_echange_detail'),
    # Demandes personnelles
    path('mes-demandes/envoyees/', views.mes_demandes_envoyees, name='api_mes_demandes_envoyees'),
    path('mes-demandes/recues/', views.mes_demandes_recues, name='api_mes_demandes_recues'),
    # Actions sur les demandes
    path('echanges/<int:demande_id>/repondre/', views.repondre_demande, name='api_repondre_demande'),
    path('echanges/<int:demande_id>/decision/', views.decision_superviseur, name='api_decision_superviseur'),
    # Vues utilitaires
    path('demandes-a-traiter/', views.demandes_a_traiter, name='api_demandes_a_traiter'),
    path('echanges/statistiques/', views.statistiques_echanges, name='api_statistiques_echanges'),
    path('agents/', views.get_agents, name='get_agents'),
    path('plannings/', views.get_plannings, name='get_plannings'), 
     path('demandes-a-traiter/', views.demandes_a_traiter, name='api_demandes_a_traiter'), # NOUVELLE LIGNE AJOUTÉE
    path('echanges/<int:demande_id>/decision/', views.decision_superviseur, name='api_decision_superviseur'),
]
