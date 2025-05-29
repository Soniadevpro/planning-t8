import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PlanningService from '../services/planning';
import '../style/_planning.css';

const Planning = () => {
  const { user, isSuperviseur, logout } = useAuth();
  const navigate = useNavigate();
  
  const [plannings, setPlannings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editMode, setEditMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  // Types de service avec couleurs
  const serviceTypes = {
    matin: { label: 'Matin', color: '#e3f2fd', abbr: 'M' },
    apres_midi: { label: 'Après-midi', color: '#fff3e0', abbr: 'AM' },
    journee: { label: 'Journée', color: '#e8f5e8', abbr: 'J' },
    nuit: { label: 'Nuit', color: '#f3e5f5', abbr: 'N' },
    repos: { label: 'Repos', color: '#f5f5f5', abbr: 'R' },
    vacances: { label: 'Vacances', color: '#fff8e1', abbr: 'V' },
    jour_ferie_repos: { label: 'Férié', color: '#fce4ec', abbr: 'F' },
  };

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger tous les plannings
      const allPlannings = await PlanningService.getPlannings();
      
      // Filtrer par mois/année actuelle
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthPlannings = allPlannings.filter(planning => {
        const planningDate = new Date(planning.date);
        return planningDate >= startDate && planningDate <= endDate;
      });
      
      setPlannings(monthPlannings);
      
      // Extraire la liste unique des agents
      const uniqueAgents = [...new Map(
        allPlannings.map(p => [p.agent, { id: p.agent, name: p.agent_name || 'Agent' + p.agent }])
      ).values()];
      
      setAgents(uniqueAgents);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return days;
  };

  // Obtenir le planning d'un agent pour une date donnée
  const getPlanningForAgentAndDate = (agentId, date) => {
    return plannings.find(p => 
      p.agent === agentId && 
      new Date(p.date).toDateString() === date.toDateString()
    );
  };

  // Navigation mois
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Formatter le mois/année
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const days = getDaysInMonth();

  if (loading) {
    return (
      <div className="planning-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement du planning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planning-container">
      {/* Header */}
      <header className="planning-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🚋 Planning T8</h1>
            <p>Bienvenue, {user?.first_name || user?.username}</p>
          </div>
          
          <nav className="header-nav">
            <button 
              className="nav-btn"
              onClick={() => navigate('/dashboard')}
            >
              Mon Dashboard
            </button>
            <button 
              className="nav-btn"
              onClick={() => navigate('/exchanges')}
            >
              Échanges
            </button>
            <button 
              className="nav-btn logout-btn"
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </header>

      {/* Contrôles du calendrier */}
      <div className="calendar-controls">
        <button 
          className="month-nav-btn"
          onClick={() => navigateMonth(-1)}
        >
          ← Mois précédent
        </button>
        
        <h2 className="current-month">
          {formatMonthYear()}
        </h2>
        
        <button 
          className="month-nav-btn"
          onClick={() => navigateMonth(1)}
        >
          Mois suivant →
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Légende */}
      <div className="legend">
        <h3>Légende :</h3>
        <div className="legend-items">
          {Object.entries(serviceTypes).map(([key, service]) => (
            <div key={key} className="legend-item">
              <span 
                className="legend-color"
                style={{ backgroundColor: service.color }}
              >
                {service.abbr}
              </span>
              <span>{service.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendrier */}
      <div className="calendar-wrapper">
        <div className="calendar-table">
          {/* En-tête des jours */}
          <div className="calendar-header">
            <div className="agent-column-header">Agents</div>
            {days.map(day => (
              <div key={day.toDateString()} className="day-header">
                <div className="day-number">{day.getDate()}</div>
                <div className="day-name">
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>

          {/* Lignes des agents */}
          <div className="calendar-body">
            {agents.map(agent => (
              <div key={agent.id} className="agent-row">
                <div className="agent-name">
                  {agent.name}
                </div>
                
                {days.map(day => {
                  const planning = getPlanningForAgentAndDate(agent.id, day);
                  const serviceType = planning ? serviceTypes[planning.type_service] : null;
                  
                  return (
                    <div 
                      key={`${agent.id}-${day.toDateString()}`}
                      className={`planning-cell ${planning ? 'has-planning' : 'empty-cell'}`}
                      style={serviceType ? { backgroundColor: serviceType.color } : {}}
                      title={serviceType ? 
                        `${agent.name} - ${day.getDate()}/${day.getMonth() + 1} - ${serviceType.label}` : 
                        'Aucun planning'
                      }
                    >
                      {serviceType && (
                        <div className="service-content">
                          <span className="service-abbr">{serviceType.abbr}</span>
                          {planning.heure_debut && (
                            <span className="service-time">
                              {planning.heure_debut.slice(0, 5)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{plannings.length}</h3>
            <p>Plannings ce mois</p>
          </div>
          <div className="stat-card">
            <h3>{agents.length}</h3>
            <p>Agents actifs</p>
          </div>
          <div className="stat-card">
            <h3>{plannings.filter(p => p.type_service !== 'repos').length}</h3>
            <p>Jours travaillés</p>
          </div>
          <div className="stat-card">
            <h3>{plannings.filter(p => p.type_service === 'repos').length}</h3>
            <p>Jours de repos</p>
          </div>
        </div>
      </div>

      {/* Section actualités RATP */}
      <div className="news-section">
        <h3>📰 Actualités T8</h3>
        <div className="news-grid">
          <div className="news-card">
            <h4>🚧 Travaux prévus</h4>
            <p>Maintenance de la ligne T8 prévue le weekend prochain. Vérifiez vos plannings.</p>
            <small>Il y a 2 jours</small>
          </div>
          <div className="news-card">
            <h4>📅 Nouvelle procédure</h4>
            <p>Les demandes d'échange doivent être faites au moins 48h à l'avance.</p>
            <small>Il y a 1 semaine</small>
          </div>
          <div className="news-card">
            <h4>🎉 Félicitations</h4>
            <p>L'équipe T8 a été récompensée pour sa ponctualité exemplaire ce mois-ci !</p>
            <small>Il y a 2 semaines</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;