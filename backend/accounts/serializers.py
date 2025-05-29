from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour le modèle CustomUser"""
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'matricule', 'telephone', 'date_embauche', 
            'is_active', 'is_active_agent', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class LoginSerializer(serializers.Serializer):
    """Sérialiseur pour la connexion"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError("Compte utilisateur désactivé.")
            else:
                raise serializers.ValidationError("Identifiants invalides.")
        else:
            raise serializers.ValidationError("Username et password requis.")
        
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Sérialiseur pour le profil utilisateur avec informations complètes"""
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'matricule', 'telephone', 'date_embauche', 
            'is_active', 'is_active_agent', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'full_name']


class ChangePasswordSerializer(serializers.Serializer):
    """Sérialiseur pour changer le mot de passe"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas.")
        return data
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Ancien mot de passe incorrect.")
        return value