import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, isAdmin, isSuperviseur } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleInfo = () => {
    if (isAdmin()) return { label: 'Administrateur', icon: '👑' };
    if (isSuperviseur()) return { label: 'Superviseur', icon: '👨‍💼' };
    return { label: 'Agent', icon: '👷‍♂️' };
  };

  const roleInfo = getRoleInfo();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header simple */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#2563eb',
        color: 'white',
        borderRadius: '8px'
      }}>
        <div>
          <h1>📊 Dashboard T8</h1>
          <p>Bienvenue, {user?.first_name || user?.username} !</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/planning')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📅 Planning
          </button>
          <button 
            onClick={() => navigate('/exchanges')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Échanges
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2>Informations utilisateur</h2>
        <p><strong>Nom :</strong> {user?.first_name || user?.username}</p>
        <p><strong>Rôle :</strong> {roleInfo.icon} {roleInfo.label}</p>
        {user?.matricule && <p><strong>Matricule :</strong> {user.matricule}</p>}
      </div>

      {/* Actions rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          cursor: 'pointer'
        }} onClick={() => navigate('/planning')}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3>Planning Collectif</h3>
          <p>Vue mensuelle des plannings de toute l'équipe</p>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center',
          cursor: 'pointer'
        }} onClick={() => navigate('/exchanges')}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <h3>Échanges</h3>
          <p>Gérez vos demandes d'échange</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;