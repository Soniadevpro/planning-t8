import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, isToday, isWeekend } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTheme } from '../contexts/ThemeContext'
import planningService from '../services/planning'
import api from '../services/api'
import "../styles/planning.css"
const Planning = () => {
  const { user, isAdmin, isSuperviseur } = useAuth()
  const { isDarkMode } = useTheme()
  
  const [viewMode, setViewMode] = useState('week') // Par défaut en vue semaine pour la vue agent
  const [currentDate, setCurrentDate] = useState(new Date())
  const [plannings, setPlannings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState('all')
  const [agents, setAgents] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [editingPlanning, setEditingPlanning] = useState(null)

  // Types de service avec couleurs et icônes
  const serviceTypes = {
    matin: { 
      label: 'Matin', 
      color: 'bg-blue-500 text-white',
      lightColor: 'service-matin',
      icon: '🌅',
      horaires: '05:00 - 13:00'
    },
    apres_midi: { 
      label: 'Après-midi', 
      color: 'bg-orange-500 text-white',
      lightColor: 'service-apres-midi',
      icon: '☀️',
      horaires: '13:00 - 21:00'
    },
    journee: { 
      label: 'Journée', 
      color: 'bg-green-500 text-white',
      lightColor: 'service-journee',
      icon: '📅',
      horaires: '08:45 - 16:30'
    },
    nuit: { 
      label: 'Nuit', 
      color: 'bg-purple-500 text-white',
      lightColor: 'service-nuit',
      icon: '🌙',
      horaires: '21:00 - 05:00'
    },
    repos: { 
      label: 'Repos', 
      color: 'bg-gray-500 text-white',
      lightColor: 'service-repos',
      icon: '😴',
      horaires: null
    },
    vacances: { 
      label: 'Vacances', 
      color: 'bg-yellow-500 text-white',
      lightColor: 'service-vacances',
      icon: '🏖️',
      horaires: null
    },
    jour_ferie_repos: {
      label: 'Jour férié',
      color: 'bg-red-500 text-white',
      lightColor: 'service-ferie',
      icon: '🎉',
      horaires: null
    }
  }

  // Charger la liste des agents
  const loadAgents = async () => {
    try {
      const response = await api.get('/users/')
      setAgents(response.data)
    } catch (err) {
      console.error('Erreur lors du chargement des agents:', err)
    }
  }

  // Charger les plannings depuis l'API
  const loadPlannings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let dateDebut, dateFin
      
      if (viewMode === 'week') {
        dateDebut = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        dateFin = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      } else {
        dateDebut = format(startOfMonth(currentDate), 'yyyy-MM-dd')
        dateFin = format(endOfMonth(currentDate), 'yyyy-MM-dd')
      }
      
      const filters = {
        date_debut: dateDebut,
        date_fin: dateFin
      }

      // Ajouter le filtre agent si nécessaire
      if (selectedAgent !== 'all' && selectedAgent) {
        filters.agent = selectedAgent
      }

      const data = await planningService.getPlannings(filters)
      setPlannings(data)
      
    } catch (err) {
      setError('Erreur lors du chargement des plannings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Charger les données au montage et quand les dépendances changent
  useEffect(() => {
    loadAgents()
  }, [])

  useEffect(() => {
    loadPlannings()
  }, [currentDate, selectedAgent, viewMode])

  // Obtenir les jours à afficher selon le mode de vue
  const getDays = () => {
    switch (viewMode) {
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        })
      case 'month':
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
        return eachDayOfInterval({ start, end })
      default:
        return []
    }
  }

  const days = getDays()

  // Navigation dans les dates
  const handleDateNavigation = (direction) => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(direction > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
        break
      case 'month':
        setCurrentDate(direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
        break
    }
  }

  // Obtenir les plannings pour un agent et une date donnée
  const getPlanningForAgentAndDate = (agentId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return plannings.find(p => p.agent === agentId && p.date === dateStr)
  }

  // Obtenir l'agent par ID
  const getAgentById = (agentId) => {
    return agents.find(a => a.id === agentId)
  }

  // Gérer le clic sur une cellule du planning
  const handleCellClick = (agentId, date) => {
    if (isAdmin() || isSuperviseur()) {
      setSelectedDate(date)
      setSelectedAgentId(agentId)
      setShowAddModal(true)
    }
  }

  // Sauvegarder un planning
  const handleSavePlanning = async (formData) => {
    try {
      if (editingPlanning) {
        await planningService.updatePlanning(editingPlanning.id, formData)
      } else {
        await planningService.createPlanning(formData)
      }
      // Recharger les plannings
      await loadPlannings()
      setShowAddModal(false)
      setEditingPlanning(null)
    } catch (err) {
      alert('Erreur lors de la sauvegarde du planning')
      console.error(err)
    }
  }

  // Supprimer un planning
  const handleDeletePlanning = async (planningId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      try {
        await planningService.deletePlanning(planningId)
        await loadPlannings()
      } catch (err) {
        alert('Erreur lors de la suppression du planning')
        console.error(err)
      }
    }
  }

  // Formulaire d'ajout/modification
  const PlanningForm = ({ date, agentId, planning, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      agent: planning?.agent || agentId || '',
      type_service: planning?.type_service || 'journee',
      date: format(date, 'yyyy-MM-dd'),
      notes: planning?.notes || ''
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      onSave(formData)
    }

    return (
      <div className="modal-overlay active">
        <div className="modal-container">
          <div className="modal-header">
            <h3 className="modal-title">
              {planning ? 'Modifier' : 'Ajouter'} un planning
            </h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Agent</label>
                <select
                  value={formData.agent}
                  onChange={(e) => setFormData({...formData, agent: parseInt(e.target.value)})}
                  className="input"
                  required
                >
                  <option value="">Sélectionner un agent</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name} ({agent.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Type de service</label>
                <select
                  value={formData.type_service}
                  onChange={(e) => setFormData({...formData, type_service: e.target.value})}
                  className="input"
                  required
                >
                  {Object.entries(serviceTypes).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.icon} {type.label} {type.horaires && `(${type.horaires})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Notes (optionnel)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                {planning ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Affichage du titre selon le mode de vue
  const getTitle = () => {
    switch (viewMode) {
      case 'week':
        return `Semaine du ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMMM yyyy', { locale: fr })}`
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: fr })
      default:
        return ''
    }
  }

  // Filtrer les agents à afficher
  const getAgentsToDisplay = () => {
    if (selectedAgent !== 'all' && selectedAgent) {
      return agents.filter(agent => agent.id === parseInt(selectedAgent))
    }
    return agents
  }

  const agentsToDisplay = getAgentsToDisplay()

  return (
    <div className="planning-container">
      <div className="planning-content">
        {/* En-tête */}
        <div className="planning-header">
          <div className="header-left">
            <h1>Planning {getTitle()}</h1>
            
            <div className="planning-controls">
              {/* Sélecteur de vue */}
              <div className="view-selector">
                <button
                  onClick={() => setViewMode('week')}
                  className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                >
                  Mois
                </button>
              </div>

              {/* Filtre agent pour admin/superviseur */}
              {(isAdmin() || isSuperviseur()) && (
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="agent-filter"
                >
                  <option value="all">Tous les agents</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="navigation">
            <button
              onClick={() => handleDateNavigation(-1)}
              className="nav-btn"
            >
              <i className="fas fa-chevron-left"></i>
              Précédent
            </button>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="today-btn"
            >
              Aujourd'hui
            </button>

            <button
              onClick={() => handleDateNavigation(1)}
              className="nav-btn"
            >
              Suivant
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Légende des types de service */}
        <div className="legend">
          <h3>Types de service</h3>
          <div className="legend-items">
            {Object.entries(serviceTypes).map(([key, type]) => (
              <div key={key} className={`legend-item ${type.lightColor}`}>
                {type.icon} {type.label}
                {type.horaires && <span>({type.horaires})</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Planning par agent */}
        <div className="planning-table">
          {loading ? (
            <div className="loading-center">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : (
            <>
              {/* En-tête du tableau */}
              <div className="planning-table-header">
                <div className="agent-column-header">Agent</div>
                {days.map((day) => (
                  <div 
                    key={day.toString()} 
                    className={`day-column-header ${isToday(day) ? 'today' : ''} ${isWeekend(day) ? 'weekend' : ''}`}
                  >
                    <div className="day-name">
                      {format(day, 'EEEE', { locale: fr })}
                    </div>
                    <div className="day-date">
                      {format(day, 'd MMM', { locale: fr })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lignes des agents */}
              <div className="planning-table-body">
                {agentsToDisplay.map((agent) => (
                  <div key={agent.id} className="agent-row">
                    {/* Colonne agent */}
                    <div className="agent-cell">
                      <div className="agent-info">
                        <div className="agent-avatar">
                          {agent.first_name?.charAt(0)}{agent.last_name?.charAt(0)}
                        </div>
                        <div className="agent-details">
                          <div className="agent-name">
                            {agent.first_name} {agent.last_name}
                          </div>
                          <div className="agent-matricule">
                            {agent.matricule}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Colonnes des jours */}
                    {days.map((day) => {
                      const planning = getPlanningForAgentAndDate(agent.id, day)
                      const serviceType = planning ? serviceTypes[planning.type_service] : null
                      const isTodayDate = isToday(day)
                      const isWeekendDay = isWeekend(day)

                      return (
                        <div
                          key={day.toString()}
                          onClick={() => handleCellClick(agent.id, day)}
                          className={`day-cell ${isTodayDate ? 'today' : ''} ${isWeekendDay ? 'weekend' : ''}`}
                        >
                          {planning && serviceType ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isAdmin() || isSuperviseur()) {
                                  setEditingPlanning(planning)
                                  setSelectedDate(new Date(planning.date))
                                  setSelectedAgentId(agent.id)
                                  setShowAddModal(true)
                                }
                              }}
                              className={`planning-slot ${serviceType.lightColor}`}
                            >
                              <div className="service-info">
                                <span className="service-icon">{serviceType.icon}</span>
                                <span className="service-label">{serviceType.label}</span>
                              </div>
                              {serviceType.horaires && (
                                <div className="service-hours">{serviceType.horaires}</div>
                              )}
                              {planning.notes && (
                                <div className="service-notes" title={planning.notes}>
                                  <i className="fas fa-sticky-note"></i>
                                </div>
                              )}
                              {(isAdmin() || isSuperviseur()) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeletePlanning(planning.id)
                                  }}
                                  className="delete-btn"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="empty-slot">
                              {(isAdmin() || isSuperviseur()) && (
                                <span className="add-indicator">+</span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bouton d'ajout flottant pour admin/superviseur */}
        {(isAdmin() || isSuperviseur()) && (
          <button
            onClick={() => {
              setSelectedDate(new Date())
              setSelectedAgentId(null)
              setEditingPlanning(null)
              setShowAddModal(true)
            }}
            className="floating-add-btn"
          >
            <i className="fas fa-plus"></i>
          </button>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showAddModal && selectedDate && (
        <PlanningForm
          date={selectedDate}
          agentId={selectedAgentId}
          planning={editingPlanning}
          onClose={() => {
            setShowAddModal(false)
            setEditingPlanning(null)
            setSelectedDate(null)
            setSelectedAgentId(null)
          }}
          onSave={handleSavePlanning}
        />
      )}
    </div>
  )
}

export default Planning