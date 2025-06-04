import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePhoto from './ProfilePhoto';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin, isSuperviseur } = useAuth();
  const navigate = useNavigate();
  const [userPhoto, setUserPhoto] = useState(user?.photoUrl || null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleInfo = () => {
    if (isAdmin()) return { label: 'Administrateur', icon: '👑', class: 'admin' };
    if (isSuperviseur()) return { label: 'Superviseur', icon: '👨‍💼', class: 'superviseur' };
    return { label: 'Agent', icon: '👷‍♂️', class: 'agent' };
  };

  const roleInfo = getRoleInfo();

  const handlePhotoChange = (file, previewUrl) => {
    // Dans une application réelle, vous téléchargeriez le fichier vers votre API
    // puis récupéreriez l'URL de la photo téléchargée pour l'afficher
    // Ici nous utilisons simplement l'URL de prévisualisation comme simulacre
    setUserPhoto(previewUrl);
    
    // Mise à jour fictive du contexte utilisateur
    if (user) {
      user.photoUrl = previewUrl;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="dashboard-title">
                <i className="fas fa-chart-line"></i>
                Tableau de bord <span>T8</span>
              </h1>
              <p className="dashboard-subtitle">Bienvenue, {user?.first_name || user?.username} !</p>
            </div>
            
            <div className="dashboard-actions">
              <button 
                className="dashboard-action-btn"
                onClick={() => navigate('/planning')}
              >
                <i className="far fa-calendar-alt"></i>
                Planning
              </button>
              <button 
                className="dashboard-action-btn"
                onClick={() => navigate('/exchanges')}
              >
                <i className="fas fa-exchange-alt"></i>
                Échanges
              </button>
              <button 
                className="dashboard-action-btn danger"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Carte utilisateur */}
        <div className="user-card">
          <ProfilePhoto user={user} onPhotoChange={handlePhotoChange} />
          
          <div className="user-info">
            <h2>{user?.first_name || user?.username}</h2>
            
            <div className="user-detail">
              <strong>Rôle :</strong>
              {roleInfo.label}
              <span className={`role-badge ${roleInfo.class}`}>
                {roleInfo.icon} {roleInfo.label}
              </span>
            </div>
            
            {user?.matricule && (
              <div className="user-detail">
                <strong>Matricule :</strong>
                {user.matricule}
              </div>
            )}
            
            <div className="user-detail">
              <strong>Dernière connexion :</strong>
              {new Date().toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Cartes de navigation */}
        <div className="nav-cards">
          <div className="nav-card" onClick={() => navigate('/planning')}>
            <div className="nav-card-icon">
              <i className="far fa-calendar-alt"></i>
            </div>
            <h3>Planning Collectif</h3>
            <p>Vue mensuelle des plannings de toute l'équipe</p>
          </div>

          <div className="nav-card" onClick={() => navigate('/exchanges')}>
            <div className="nav-card-icon">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <h3>Échanges</h3>
            <p>Gérez vos demandes d'échange de service</p>
          </div>
          
          <div className="nav-card" onClick={() => navigate('/profile')}>
            <div className="nav-card-icon">
              <i className="far fa-user-circle"></i>
            </div>
            <h3>Mon Profil</h3>
            <p>Consultez et modifiez vos informations personnelles</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">24</div>
              <div className="stat-label">Jours travaillés ce mois</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">7</div>
              <div className="stat-label">Jours de repos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2</div>
              <div className="stat-label">Échanges en attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Taux de présence</div>
            </div>
          </div>
        </div>

        {/* Actualités */}
        <div className="news-section">
          <h2>
            <i className="far fa-newspaper"></i>
            Actualités T8
          </h2>
          
          <div className="news-grid">
            <div className="news-card">
              <h3>
                <i className="fas fa-hard-hat"></i>
                Travaux prévus
              </h3>
              <p>Maintenance de la ligne T8 prévue le weekend prochain. Vérifiez vos plannings pour les ajustements d'horaires.</p>
              <div className="news-date">Il y a 2 jours</div>
            </div>
            
            <div className="news-card">
              <h3>
                <i className="far fa-clipboard"></i>
                Nouvelle procédure
              </h3>
              <p>Les demandes d'échange doivent être faites au moins 48h à l'avance. Consultez la note de service pour plus de détails.</p>
              <div className="news-date">Il y a 1 semaine</div>
            </div>
            
            <div className="news-card">
              <h3>
                <i className="fas fa-award"></i>
                Félicitations
              </h3>
              <p>L'équipe T8 a été récompensée pour sa ponctualité exemplaire ce mois-ci ! Un grand merci à tous les agents.</p>
              <div className="news-date">Il y a 2 semaines</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;