import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePhoto from './ProfilePhoto';
import '../styles/profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    matricule: user?.matricule || ''
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de sauvegarde à implémenter
    console.log('Données du formulaire:', formData);
  };

  const getRoleInfo = () => {
    if (user?.role === 'admin') return { label: 'Administrateur', icon: '👑' };
    if (user?.role === 'superviseur') return { label: 'Superviseur', icon: '👨‍💼' };
    return { label: 'Agent', icon: '👷‍♂️' };
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="far fa-user-circle"></i>
              <span>Mon Profil</span>
            </h1>
            <p>Gérez vos informations personnelles</p>
          </div>
          
          <nav className="header-nav">
            <button 
              className="nav-btn"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </button>
            <button 
              className="nav-btn"
              onClick={() => navigate('/planning')}
            >
              <i className="far fa-calendar-alt"></i>
              Planning
            </button>
            <button 
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i>
              Déconnexion
            </button>
          </nav>
        </div>
      </header>

      <div className="profile-content">
        {/* Statistiques */}
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
            <div className="stat-number">98%</div>
            <div className="stat-label">Taux de présence</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">12</div>
            <div className="stat-label">Échanges effectués</div>
          </div>
        </div>

        {/* Carte profil */}
        <div className="profile-card">
          <div className="profile-photo-section">
            <ProfilePhoto user={user} />
            <div className="profile-info">
              <h2 className="profile-name">{formData.firstName || user?.username}</h2>
              <div className="profile-role">
                {roleInfo.icon} {roleInfo.label}
              </div>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Nom</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@ratp.fr"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Votre numéro de téléphone"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="matricule">Matricule</label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                className="form-control"
                value={formData.matricule}
                onChange={handleChange}
                placeholder="Votre matricule"
                disabled
              />
              <p className="form-hint">Le matricule ne peut pas être modifié</p>
            </div>

            <div className="profile-actions">
              <button type="button" className="action-btn btn-cancel" onClick={() => navigate('/dashboard')}>
                <i className="fas fa-times"></i>
                Annuler
              </button>
              <button type="submit" className="action-btn btn-save">
                <i className="fas fa-save"></i>
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;