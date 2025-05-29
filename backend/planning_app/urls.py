from django.urls import path
from . import views

urlpatterns = [
    # CRUD plannings
    path('plannings/', views.PlanningListCreateView.as_view(), name='api_plannings_list'),
    path('plannings/<int:pk>/', views.PlanningDetailView.as_view(), name='api_planning_detail'),
    
    # Plannings personnels
    path('mes-plannings/', views.mes_plannings, name='api_mes_plannings'),
    
    # Vues spécialisées
    path('planning/calendrier/', views.planning_calendrier, name='api_planning_calendrier'),
    path('planning/statistiques/', views.statistiques_planning, name='api_planning_statistiques'),
]