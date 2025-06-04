import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, isToday, isSameDay, isWeekend } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';
import planningService from '../services/planning';
import api from '../services/api';

const Planning = () => {
  const { user, isAdmin, isSuperviseur } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [agents, setAgents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingPlanning, setEditingPlanning] = useState(null);

  // Types de service avec couleurs et icônes
  const serviceTypes = {
    matin: { 
      label: 'Matin', 
      color: 'bg-blue-500 text-white',
      lightColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      icon: '🌅',
      horaires: '05:00 - 13:00'
    },
    apres_midi: { 
      label: 'Après-midi', 
      color: 'bg-orange-500 text-white',
      lightColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      icon: '☀️',
      horaires: '13:00 - 21:00'
    },
    journee: { 
      label: 'Journée', 
      color: 'bg-green-500 text-white',
      lightColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      icon: '📅',
      horaires: '08:45 - 16:30'
    },
    nuit: { 
      label: 'Nuit', 
      color: 'bg-purple-500 text-white',
      lightColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      icon: '🌙',
      horaires: '21:00 - 05:00'
    },
    repos: { 
      label: 'Repos', 
      color: 'bg-gray-500 text-white',
      lightColor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      icon: '😴',
      horaires: null
    },
    vacances: { 
      label: 'Vacances', 
      color: 'bg-yellow-500 text-white',
      lightColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      icon: '🏖️',
      horaires: null
    },
    jour_ferie_repos: {
      label: 'Jour férié',
      color: 'bg-red-500 text-white',
      lightColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      icon: '🎉',
      horaires: null
    }
  };

  // Charger la liste des agents
  const loadAgents = async () => {
    try {
      const response = await api.get('/users/');
      setAgents(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des agents:', err);
    }
  };

  // Charger les plannings depuis l'API
  const loadPlannings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dateDebut = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const dateFin = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      
      const filters = {
        date_debut: dateDebut,
        date_fin: dateFin
      };

      // Ajouter le filtre agent si nécessaire
      if (selectedAgent !== 'all' && selectedAgent) {
        filters.agent = selectedAgent;
      }

      const data = await planningService.getPlannings(filters);
      setPlannings(data);
      
    } catch (err) {
      setError('Erreur lors du chargement des plannings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand les dépendances changent
  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    loadPlannings();
  }, [currentDate, selectedAgent]);

  // Obtenir les jours à afficher selon le mode de vue
  const getDays = () => {
    switch (viewMode) {
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        });
      case 'month':
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
      default:
        return [];
    }
  };

  const days = getDays();

  // Navigation dans les dates
  const handleDateNavigation = (direction) => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(direction > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
    }
  };

  // Obtenir les plannings pour une date donnée
  const getPlanningsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plannings.filter(p => p.date === dateStr);
  };

  // Obtenir l'agent par ID
  const getAgentById = (agentId) => {
    return agents.find(a => a.id === agentId);
  };

  // Gérer le clic sur une cellule du calendrier
  const handleCellClick = (date) => {
    if (isAdmin() || isSuperviseur()) {
      setSelectedDate(date);
      setShowAddModal(true);
    }
  };

  // Sauvegarder un planning
  const handleSavePlanning = async (formData) => {
    try {
      if (editingPlanning) {
        await planningService.updatePlanning(editingPlanning.id, formData);
      } else {
        await planningService.createPlanning(formData);
      }
      // Recharger les plannings
      await loadPlannings();
      setShowAddModal(false);
      setEditingPlanning(null);
    } catch (err) {
      alert('Erreur lors de la sauvegarde du planning');
      console.error(err);
    }
  };

  // Supprimer un planning
  const handleDeletePlanning = async (planningId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      try {
        await planningService.deletePlanning(planningId);
        await loadPlannings();
      } catch (err) {
        alert('Erreur lors de la suppression du planning');
        console.error(err);
      }
    }
  };

  // Formulaire d'ajout/modification
  const PlanningForm = ({ date, planning, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      agent: planning?.agent || '',
      type_service: planning?.type_service || 'journee',
      date: format(date, 'yyyy-MM-dd'),
      notes: planning?.notes || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
          <h3 className="text-lg font-bold mb-4 dark:text-white">
            {planning ? 'Modifier' : 'Ajouter'} un planning
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Agent
              </label>
              <select
                value={formData.agent}
                onChange={(e) => setFormData({...formData, agent: parseInt(e.target.value)})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Type de service
              </label>
              <select
                value={formData.type_service}
                onChange={(e) => setFormData({...formData, type_service: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                {Object.entries(serviceTypes).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.label} {type.horaires && `(${type.horaires})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {planning ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Affichage du titre selon le mode de vue
  const getTitle = () => {
    switch (viewMode) {
      case 'week':
        return `Semaine du ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMMM yyyy', { locale: fr })}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      default:
        return '';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* En-tête */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Planning {getTitle()}
              </h1>
              
              <div className="flex items-center space-x-2">
                {/* Sélecteur de vue */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Semaine
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}
                  >
                    Mois
                  </button>
                </div>

                {/* Filtre agent pour admin/superviseur */}
                {(isAdmin() || isSuperviseur()) && (
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => handleDateNavigation(-1)}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </button>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                Aujourd'hui
              </button>

              <button
                onClick={() => handleDateNavigation(1)}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Suivant
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Légende des types de service */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Légende</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(serviceTypes).map(([key, type]) => (
                <div
                  key={key}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${type.lightColor}`}
                >
                  {type.icon} {type.label}
                  {type.horaires && <span className="text-xs ml-1">({type.horaires})</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Calendrier */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-8">{error}</div>
            ) : (
              <>
                {/* En-têtes des jours */}
                <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-r dark:border-gray-600 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grille du calendrier */}
                <div className="grid grid-cols-7">
                  {days.map((day) => {
                    const dayPlannings = getPlanningsForDate(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isWeekendDay = isWeekend(day);
                    const isTodayDate = isToday(day);

                    return (
                      <div
                        key={day.toString()}
                        onClick={() => handleCellClick(day)}
                        className={`
                          min-h-[120px] p-2 border-r border-b dark:border-gray-700 cursor-pointer
                          ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900' : ''}
                          ${isWeekendDay ? 'bg-gray-100 dark:bg-gray-800' : ''}
                          ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                          hover:bg-gray-50 dark:hover:bg-gray-700
                        `}
                      >
                        <div className={`
                          text-sm font-medium mb-1
                          ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}
                          ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : ''}
                        `}>
                          {format(day, 'd')}
                        </div>

                        <div className="space-y-1">
                          {dayPlannings.map((planning) => {
                            const agent = getAgentById(planning.agent);
                            const serviceType = serviceTypes[planning.type_service];
                            
                            if (!agent || !serviceType) return null;
                            
                            return (
                              <div
                                key={planning.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isAdmin() || isSuperviseur()) {
                                    setEditingPlanning(planning);
                                    setSelectedDate(new Date(planning.date));
                                    setShowAddModal(true);
                                  }
                                }}
                                className={`
                                  text-xs p-1 rounded cursor-pointer
                                  ${serviceType.lightColor}
                                  hover:opacity-80 transition-opacity
                                `}
                              >
                                <div className="font-medium">
                                  {agent.first_name} {agent.last_name?.charAt(0)}.
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>{serviceType.icon} {serviceType.label}</span>
                                  {(isAdmin() || isSuperviseur()) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePlanning(planning.id);
                                      }}
                                      className="ml-1 text-red-500 hover:text-red-700"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Bouton d'ajout flottant pour admin/superviseur */}
          {(isAdmin() || isSuperviseur()) && (
            <button
              onClick={() => {
                setSelectedDate(new Date());
                setEditingPlanning(null);
                setShowAddModal(true);
              }}
              className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {showAddModal && selectedDate && (
        <PlanningForm
          date={selectedDate}
          planning={editingPlanning}
          onClose={() => {
            setShowAddModal(false);
            setEditingPlanning(null);
            setSelectedDate(null);
          }}
          onSave={handleSavePlanning}
        />
      )}
    </div>
  );
};

export default Planning;