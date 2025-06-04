import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/exchanges.css';

const Exchanges = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Données simulées pour les échanges
  const exchanges = [
    {
      id: 1,
      date: '2025-05-15',
      type: 'matin',
      status: 'pending',
      requestedBy: 'Jean Dupont',
      proposedDate: '2025-05-20',
      proposedType: 'après-midi'
    },
    {
      id: 2,
      date: '2025-05-18',
      type: 'journée',
      status: 'accepted',
      requestedBy: 'Marie Martin',
      proposedDate: '2025-05-22',
      proposedType: 'journée'
    }
  ];

  return (
    <div className="exchanges-container">
      {/* Header */}
      <header className="exchanges-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-exchange-alt"></i>
              <span>Échanges de Service</span>
            </h1>
            <p>Bienvenue, {user?.first_name || user?.username}</p>
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

      <div className="container">
        {/* Onglets */}
        <div className="exchanges-tabs">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="fas fa-clock"></i>
            En attente
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history"></i>
            Historique
          </button>
          <button 
            className="tab-btn create-btn"
            onClick={() => {/* Logique pour créer un nouvel échange */}}
          >
            <i className="fas fa-plus"></i>
            Nouvelle demande
          </button>
        </div>

        {/* Liste des échanges */}
        <div className="exchanges-list">
          {exchanges.map(exchange => (
            <div key={exchange.id} className="exchange-card">
              <div className="exchange-header">
                <div className="exchange-date">
                  <i className="far fa-calendar"></i>
                  {exchange.date}
                </div>
                <div className={`exchange-status ${exchange.status}`}>
                  {exchange.status === 'pending' ? 'En attente' : 'Accepté'}
                </div>
              </div>
              
              <div className="exchange-details">
                <div className="exchange-service">
                  <strong>Service proposé :</strong>
                  <span>{exchange.type}</span>
                </div>
                <div className="exchange-arrow">
                  <i className="fas fa-exchange-alt"></i>
                </div>
                <div className="exchange-service">
                  <strong>Service souhaité :</strong>
                  <span>{exchange.proposedType}</span>
                </div>
              </div>
              
              <div className="exchange-footer">
                <div className="exchange-user">
                  <i className="far fa-user"></i>
                  {exchange.requestedBy}
                </div>
                <div className="exchange-actions">
                  <button className="action-btn accept">
                    <i className="fas fa-check"></i>
                    Accepter
                  </button>
                  <button className="action-btn reject">
                    <i className="fas fa-times"></i>
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exchanges;