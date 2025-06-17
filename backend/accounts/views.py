from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import CustomUser
from .serializers import (
    CustomUserSerializer, 
    LoginSerializer, 
    UserProfileSerializer,
    ChangePasswordSerializer
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def login_view(request):
    """API de connexion"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        
        # Créer ou récupérer le token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Connexion réussie',
            'token': token.key,
            'user': CustomUserSerializer(user).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_view(request):
    """API de déconnexion"""
    try:
        # Supprimer le token
        request.user.auth_token.delete()
    except:
        pass
    
    logout(request)
    return Response({'message': 'Déconnexion réussie'})


@api_view(['GET'])
def profile_view(request):
    """API pour récupérer le profil utilisateur"""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
def update_profile_view(request):
    """API pour mettre à jour le profil utilisateur"""
    serializer = UserProfileSerializer(
        request.user, 
        data=request.data, 
        partial=request.method == 'PATCH'
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def change_password_view(request):
    """API pour changer le mot de passe"""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Regénérer le token après changement de mot de passe
        try:
            user.auth_token.delete()
        except:
            pass
        Token.objects.create(user=user)
        
        return Response({'message': 'Mot de passe modifié avec succès'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    """API pour lister les utilisateurs (pour les échanges)"""
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Seuls les agents actifs peuvent être listés pour les échanges
        return CustomUser.objects.filter(
            is_active=True, 
            is_active_agent=True
        ).exclude(id=self.request.user.id)
    
