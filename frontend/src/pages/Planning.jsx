import { useState, useEffect } from 'react';
import { Calendar, List, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import planningService from '../services/planningService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

const Planning = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' ou 'list'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plannings, setPlannings] = useState([]);
  const [filteredPlannings, setFilteredPlannings] = useState([]);
  const [filters, setFilters] = useState({
    type_service: '',
  });

  useEffect(() => {
    loadPlannings();
  }, [selectedDate]);

  useEffect(() => {
    applyFilters();
  }, [plannings, filters]);

  const loadPlannings = async () => {
    try {
      setLoading(true);
      setError('');

      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);

      const data = await planningService.getPlannings({
        date_debut: format(startDate, 'yyyy-MM-dd'),
        date_fin: format(endDate, 'yyyy-MM-dd')
      });

      // Filtrer selon le rôle utilisateur
      const userPlannings = planningService.filterPlanningsByUser(
        data, 
        user.id, 
        user.role
      );

      setPlannings(userPlannings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...plannings];

    if (filters.type_service) {
      filtered = filtered.filter(p => p.type_service === filters.type_service);
    }

    setFilteredPlannings(filtered);
  };

  const getServiceTypeColor = (type) => {
    const colors = {
      matin: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      apres_midi: 'bg-blue-100 text-blue-800 border border-blue-200',
      journee: 'bg-green-100 text-green-800 border border-green-200',
      nuit: 'bg-purple-100 text-purple-800 border border-purple-200',
      repos: 'bg-gray-100 text-gray-800 border border-gray-200',
      vacances: 'bg-orange-100 text-orange-800 border border-orange-200',
      jour_ferie_repos: 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getServiceTypeLabel = (type) => {
    const types = planningService.getTypesService();
    const typeObj = types.find(t => t.value === type);
    return typeObj?.label || type;
  };

  const getPlanningForDate = (date) => {
    return filteredPlannings.find(p => 
      format(new Date(p.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const renderCalendarView = () => {
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Créer une grille 7x6 pour le calendrier
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-ratp-gray-900">
              {format(selectedDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
              >
                ←
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
              >
                Aujourd'hui
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
              >
                →
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-ratp-gray-200 rounded-lg overflow-hidden">
            {/* En-têtes des jours */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="bg-ratp-gray-50 py-2 px-3 text-sm font-medium text-ratp-gray-700 text-center">
                {day}
              </div>
            ))}

            {/* Jours du mois */}
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const planning = getPlanningForDate(day);
                const isCurrentMonth = isSameMonth(day, selectedDate);
                const dayIsToday = isToday(day);

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      bg-white p-2 h-24 
                      ${!isCurrentMonth ? 'opacity-50' : ''}
                      ${dayIsToday ? 'bg-ratp-blue bg-opacity-5' : ''}
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${dayIsToday ? 'text-ratp-blue' : 'text-ratp-gray-900'}
                      ${!isCurrentMonth ? 'text-ratp-gray-400' : ''}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    {planning && (
                      <div className={`
                        text-xs px-2 py-1 rounded-md
                        ${getServiceTypeColor(planning.type_service)}
                      `}>
                        {getServiceTypeLabel(planning.type_service)}
                        {planning.heure_debut && (
                          <div className="mt-1 text-xs opacity-75">
                            {planning.heure_debut}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const sortedPlannings = [...filteredPlannings].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-ratp-gray-900 mb-4">
            Liste des plannings
          </h2>
          
          {sortedPlannings.length > 0 ? (
            <div className="space-y-3">
              {sortedPlannings.map((planning) => (
                <div 
                  key={planning.id}
                  className="flex items-center justify-between p-4 bg-ratp-gray-50 rounded-md hover:bg-ratp-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-ratp-gray-900">
                      {format(new Date(planning.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                    <Badge className={getServiceTypeColor(planning.type_service)}>
                      {getServiceTypeLabel(planning.type_service)}
                    </Badge>
                  </div>
                  
                  {planning.heure_debut && planning.heure_fin && (
                    <div className="text-sm text-ratp-gray-500 font-medium">
                      {planning.heure_debut} - {planning.heure_fin}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ratp-gray-500 text-center py-8">
              Aucun planning trouvé pour les critères sélectionnés
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ratp-gray-900">Mon Planning</h1>
          <p className="text-ratp-gray-600">Consultez votre planning de services</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filtres */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-ratp-gray-400" />
            <select
              value={filters.type_service}
              onChange={(e) => setFilters({ ...filters, type_service: e.target.value })}
              className="border border-ratp-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ratp-blue"
            >
              <option value="">Tous les services</option>
              {planningService.getTypesService().map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Boutons de vue */}
          <div className="flex rounded-md shadow-sm">
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-r-none"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendrier
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none border-l-0"
            >
              <List className="h-4 w-4 mr-1" />
              Liste
            </Button>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} />

      {viewMode === 'calendar' ? renderCalendarView() : renderListView()}

      {/* Légende */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-sm font-medium text-ratp-gray-900 mb-3">Légende</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {planningService.getTypesService().map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-sm ${getServiceTypeColor(type.value)}`}></div>
              <span className="text-xs text-ratp-gray-600">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planning;