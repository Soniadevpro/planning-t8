import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = AuthService.isAuthenticated();
      const currentUser = AuthService.getCurrentUser();
      
      setIsAuthenticated(isAuth);
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Connexion
  const login = async (username, password) => {
    try {
      const { token, user: userData } = await AuthService.login(username, password);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Mise à jour du profil
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await AuthService.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Changement de mot de passe
  const changePassword = async (oldPassword, newPassword, newPasswordConfirm) => {
    try {
      await AuthService.changePassword(oldPassword, newPassword, newPasswordConfirm);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Vérification des rôles
  const isAdmin = () => user?.role === 'admin';
  const isSuperviseur = () => user?.role === 'superviseur';
  const isAgent = () => user?.role === 'agent';

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    isAdmin,
    isSuperviseur,
    isAgent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};