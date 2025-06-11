import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import "../styles/login.css"
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await login(formData.username, formData.password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Erreur de connexion')
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="fas fa-subway"></i>
          </div>
          <h1 className="login-title">Planning T8</h1>
          <p className="login-subtitle">Connexion à votre espace agent</p>
        </div>

        <div className="login-body">
          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="demo-info">
            <h4>Comptes de démonstration :</h4>
            <div className="demo-accounts">
              <div className="demo-account">
                <strong>Admin :</strong> admin / password
              </div>
              <div className="demo-account">
                <strong>Superviseur :</strong> superviseur / password
              </div>
              <div className="demo-account">
                <strong>Agent :</strong> agent / password
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Entrez votre nom d'utilisateur"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Entrez votre mot de passe"
                disabled={loading}
              />
              <p className="form-hint">
                Utilisez "password" pour tous les comptes de démonstration
              </p>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Connexion</span>
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} RATP T8 - Application de démonstration</p>
        </div>
      </div>
    </div>
  )
}

export default Login