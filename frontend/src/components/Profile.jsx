import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ProfilePhoto from './ProfilePhoto'
import "../styles/profil.css"
const Profile = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    matricule: user?.matricule || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Logique de sauvegarde à implémenter
    console.log('Données du formulaire:', formData)
    alert('Profil mis à jour avec succès !')
  }

  const getRoleInfo = () => {
    if (user?.role === 'admin') return { label: 'Administrateur', icon: '👑' }
    if (user?.role === 'superviseur') return { label: 'Superviseur', icon: '👨‍💼' }
    return { label: 'Agent', icon: '👷‍♂️' }
  }

  const roleInfo = getRoleInfo()

  return (
    <div className="profile-container">
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
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="input"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="input"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@ratp.fr"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Votre numéro de téléphone"
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="matricule">Matricule</label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                className="input"
                value={formData.matricule}
                onChange={handleChange}
                placeholder="Votre matricule"
                disabled
              />
              <p className="form-hint">Le matricule ne peut pas être modifié</p>
            </div>

            <div className="profile-actions">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i>
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile