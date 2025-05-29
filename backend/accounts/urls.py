from django.urls import path
from . import views

urlpatterns = [
    # Authentification
    path('auth/login/', views.login_view, name='api_login'),
    path('auth/logout/', views.logout_view, name='api_logout'),
    path('auth/profile/', views.profile_view, name='api_profile'),
    path('auth/profile/update/', views.update_profile_view, name='api_update_profile'),
    path('auth/change-password/', views.change_password_view, name='api_change_password'),
    
    # Liste des utilisateurs
    path('users/', views.UserListView.as_view(), name='api_users_list'),
]