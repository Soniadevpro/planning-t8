import { useState, useEffect } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import authService from '../services/authService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authService.updateProfile(profileData);
      updateUser(updatedUser);
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.new_password_confirm
      );
      setSuccess('Mot de passe modifié avec succès');
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ratp-gray-900">Mon Profil</h1>
        <p className="text-ratp-gray-600">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      {/* Messages */}
      <ErrorMessage message={error} />
      {success && (
        <div className="flex items-center p-4 text-green-700 bg-green-50 border border-green-200 rounded-md">
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {/* Onglets */}
        <div className="border-b border-ratp-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-ratp-blue text-ratp-blue'
                  : 'border-transparent text-ratp-gray-500 hover:text-ratp-gray-700 hover:border-ratp-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Informations personnelles</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-ratp-blue text-ratp-blue'
                  : 'border-transparent text-ratp-gray-500 hover:text-ratp-gray-700 hover:border-ratp-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Mot de passe</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-ratp-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-ratp-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ratp-blue focus:border-ratp-blue"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-ratp-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border border-ratp-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ratp-blue focus:border-ratp-blue"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ratp-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full border border-ratp-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ratp-blue focus:border-ratp-blue"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Sauvegarder</span>
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="old_password" className="block text-sm font-medium text-ratp-gray-700">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  name="old_password"
                  id="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  required
                  className="mt-1 block w-full border border-ratp-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ratp-blue focus:border-ratp-blue"
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-ratp-gray-700">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="new_password"
                  id="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  className="mt-1 block w-full border border-ratp-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ratp-blue focus:border-ratp-blue"
                />
              </div>

              <div>
                <label htmlFor="new_password_confirm" className="block text-sm font-medium text-ratp-gray-700">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="new_password_confirm"
                  id="new_password_confirm"
                  value={passwordData.new_password_confirm}
                  onChange={handlePasswordChange}
                  required
                  className="mt-1 block w-full border border-ratp-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ratp-blue focus:border-ratp-blue"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  className="flex items-center space-x-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>Changer le mot de passe</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Informations du compte */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-ratp-gray-900 mb-4">Informations du compte</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-ratp-gray-500">Nom d'utilisateur</dt>
            <dd className="mt-1 text-sm text-ratp-gray-900">{user?.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ratp-gray-500">Rôle</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ratp-blue text-white">
                {user?.role}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ratp-gray-500">Date de création</dt>
            <dd className="mt-1 text-sm text-ratp-gray-900">
              {user?.date_joined && new Date(user.date_joined).toLocaleDateString('fr-FR')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ratp-gray-500">Dernière connexion</dt>
            <dd className="mt-1 text-sm text-ratp-gray-900">
              {user?.last_login && new Date(user.last_login).toLocaleDateString('fr-FR')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Profile;