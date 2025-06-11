import api from './api';

class AuthService {
  // Connexion utilisateur
  async login(username, password) {
    try {
      const response = await api.post('/auth/login/', {
        username,
        password,
      });
      
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.non_field_errors?.[0] ||
        'Erreur de connexion'
      );
    }
  }

  // Déconnexion
  async logout() {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le stockage local dans tous les cas
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Récupérer le profil utilisateur
  async getProfile() {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du profil');
    }
  }

  // Mettre à jour le profil
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile/update/', profileData);
      
      // Mettre à jour les infos utilisateur en local
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }

  // Changer le mot de passe
  async changePassword(oldPassword, newPassword, newPasswordConfirm) {
    try {
      const response = await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.old_password?.[0] ||
        error.response?.data?.new_password?.[0] ||
        'Erreur lors du changement de mot de passe'
      );
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Récupérer l'utilisateur actuel
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  // Récupérer le token
  getToken() {
    return localStorage.getItem('token');
  }

  // Vérifier le rôle utilisateur
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  isSuperviseur() {
    const user = this.getCurrentUser();
    return user?.role === 'superviseur';
  }

  isAgent() {
    const user = this.getCurrentUser();
    return user?.role === 'agent';
  }
}

export default new AuthService();