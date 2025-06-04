import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="120" height="40" rx="8" fill="#FFFFFF" />
              <path d="M20 10H100V30H20V10Z" fill="#004494" />
              <path d="M30 15H90V25H30V15Z" fill="#FFFFFF" />
              <path d="M40 18H80V22H40V18Z" fill="#00A566" />
            </svg>
          </div>
          
          <h1 className="login-title">
            <i className="fas fa-subway"></i>
            Planning T8
          </h1>
          <p className="login-subtitle">Connexion à votre espace agent</p>
        </div>
        
        <div className="login-body">
          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Entrez votre nom d'utilisateur"
              />
              <div className="form-highlight"></div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Entrez votre mot de passe"
              />
              <div className="form-highlight"></div>
              <p className="form-hint">Veuillez saisir le mot de passe fourni par votre administrateur</p>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  Connexion en cours...
                </>
              ) : (
                <>
                  Connexion
                  <span className="login-btn-icon">
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="login-footer">
          <p>
            &copy; {new Date().getFullYear()} RATP T8 - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;