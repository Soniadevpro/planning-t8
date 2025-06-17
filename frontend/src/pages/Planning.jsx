/// src/pages/Planning.jsx
import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, RefreshCw, Users, Clock, MapPin, Filter, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

const Planning = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plannings, setPlannings] = useState([]);
  const [filteredPlannings, setFilteredPlannings] = useState([]);
  const [filters, setFilters] = useState({ type_service: '' });

  // Types de services avec couleurs cohérentes avec le planning collectif
  const serviceTypes = {
    // REPOS
    'R': { label: 'Repos', color: 'bg-gray-200 text-gray-800', creneau: 'repos' },
    'repos': { label: 'Repos', color: 'bg-gray-200 text-gray-800', creneau: 'repos' },
    
    // SERVICES MATIN (6h-14h) - Tons verts/bleus
    '31': { label: 'Ligne 31', color: 'bg-green-400 text-green-900', creneau: 'matin' },
    '35': { label: 'Ligne 35', color: 'bg-green-500 text-white', creneau: 'matin' },
    '39': { label: 'Ligne 39', color: 'bg-blue-400 text-blue-900', creneau: 'matin' },
    'RT30': { label: 'RT30', color: 'bg-teal-400 text-teal-900', creneau: 'matin' },
    '140': { label: 'Ligne 140', color: 'bg-cyan-500 text-white', creneau: 'matin' },
    'matin': { label: 'Service Matin', color: 'bg-green-300 text-green-900', creneau: 'matin' },
    
    // SERVICES APRÈS-MIDI (14h-22h) - Tons oranges/jaunes
    '750': { label: 'Ligne 750', color: 'bg-orange-500 text-white', creneau: 'apres_midi' },
    '700': { label: 'Ligne 700', color: 'bg-yellow-500 text-yellow-900', creneau: 'apres_midi' },
    '40': { label: 'Ligne 40', color: 'bg-amber-400 text-amber-900', creneau: 'apres_midi' },
    '50': { label: 'Ligne 50', color: 'bg-orange-400 text-orange-900', creneau: 'apres_midi' },
    '90': { label: 'Ligne 90', color: 'bg-yellow-400 text-yellow-900', creneau: 'apres_midi' },
    'apres_midi': { label: 'Service Après-midi', color: 'bg-orange-300 text-orange-900', creneau: 'apres_midi' },
    
    // SERVICES JOURNÉE COMPLÈTE - Tons violets
    'journee': { label: 'Service Journée', color: 'bg-purple-300 text-purple-900', creneau: 'journee' },
    
    // SERVICES NUIT (22h-6h) - Tons sombres
    '661': { label: 'Ligne 661', color: 'bg-gray-700 text-white', creneau: 'nuit' },
    '730': { label: 'Ligne 730', color: 'bg-slate-800 text-white', creneau: 'nuit' },
    'N1': { label: 'Noctilien N1', color: 'bg-purple-800 text-white', creneau: 'nuit' },
    'N2': { label: 'Noctilien N2', color: 'bg-indigo-800 text-white', creneau: 'nuit' },
    'nuit': { label: 'Service Nuit', color: 'bg-gray-800 text-white', creneau: 'nuit' },
    
    // FORMATION - Tons violets
    'CCF': { label: 'Formation CCF', color: 'bg-purple-400 text-purple-900', creneau: 'formation' },
    'TS': { label: 'Formation TS', color: 'bg-violet-400 text-violet-900', creneau: 'formation' },
    
    // CONGÉS/VACANCES
    'vacances': { label: 'Vacances', color: 'bg-orange-200 text-orange-900', creneau: 'conges' },
    'jour_ferie_repos': { label: 'Jour férié', color: 'bg-red-200 text-red-900', creneau: 'conges' },
  };

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
      
      const startDate = viewMode === 'calendar' 
        ? startOfMonth(selectedDate)
        : startOfWeek(selectedDate, { locale: fr, weekStartsOn: 1 });
        
      const endDate = viewMode === 'calendar'
        ? endOfMonth(selectedDate)
        : addDays(startDate, 6);

      // ✅ ESSAYER D'ABORD L'API RÉELLE
      console.log('🔍 Tentative de chargement des vrais plannings...');
      try {
        const response = await api.get(`/plannings/user/?date_debut=${format(startDate, 'yyyy-MM-dd')}&date_fin=${format(endDate, 'yyyy-MM-dd')}`);
        console.log('✅ Vrais plannings chargés:', response.data.length);
        setPlannings(response.data);
        return; // Si ça marche, on s'arrête là
      } catch (apiError) {
        console.log('⚠️ API non disponible, génération de données factices...', apiError);
      }

      // Sinon, générer des données factices (votre code existant)
      console.log('📝 Génération de données factices...');
      const fakePlannings = [];
      const services = Object.keys(serviceTypes);

      let currentDate = startDate;
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        let service, horaire_debut, horaire_fin, poste;
        
        // Logique réaliste selon le jour
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          if (Math.random() < 0.6) {
            service = 'R';
            horaire_debut = null;
            horaire_fin = null;
            poste = null;
          } else {
            service = Math.random() < 0.5 ? '750' : '700';
            horaire_debut = '14:00';
            horaire_fin = '22:00';
            poste = `POSTE ${Math.floor(Math.random() * 3) + 1}`;
          }
        } else { // Semaine
          if (Math.random() < 0.1) {
            service = 'R';
            horaire_debut = null;
            horaire_fin = null;
            poste = null;
          } else {
            const creneaux = ['matin', 'apres_midi', 'nuit'];
            const creneau = creneaux[Math.floor(Math.random() * creneaux.length)];
            
            if (creneau === 'matin') {
              service = ['31', '35', '39'][Math.floor(Math.random() * 3)];
              horaire_debut = '06:00';
              horaire_fin = '14:00';
            } else if (creneau === 'apres_midi') {
              service = ['750', '700', '40'][Math.floor(Math.random() * 3)];
              horaire_debut = '14:00';
              horaire_fin = '22:00';
            } else {
              service = ['661', '730'][Math.floor(Math.random() * 2)];
              horaire_debut = '22:00';
              horaire_fin = '06:00';
            }
            poste = `POSTE ${Math.floor(Math.random() * 3) + 1}`;
          }
        }

        fakePlannings.push({
          id: `planning-${currentDate.getTime()}`,
          date: format(currentDate, 'yyyy-MM-dd'),
          type_service: service,
          horaire_debut,
          horaire_fin,
          poste,
          agent_id: user.id,
        });

        currentDate = addDays(currentDate, 1);
      }
      
      console.log('📊 Données factices générées:', fakePlannings.length);
      setPlannings(fakePlannings);
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement du planning:', err);
      setError('Erreur lors du chargement du planning');
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

  const getServiceStyle = (service) => {
    if (!service) return serviceTypes['R'];
    
    if (serviceTypes[service]) {
      return serviceTypes[service];
    }
    
    // Style par défaut
    return { label: service, color: 'bg-gray-100 text-gray-700', creneau: 'autre' };
  };

  const getPlanningForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredPlannings.find(p => p.date === dateStr);
  };

  const exportToPDF = () => {
    alert('Export PDF - À implémenter');
  };

  const renderCalendarView = () => {
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Compléter pour avoir des semaines complètes
    const startWeek = startOfWeek(startDate, { locale: fr, weekStartsOn: 1 });
    const endWeek = addDays(startWeek, 41); // 6 semaines
    const allDays = eachDayOfInterval({ start: startWeek, end: endWeek });
    
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 overflow-hidden">
        {/* En-tête du calendrier */}
        <div className="bg-ratp-gray-100 px-6 py-4 border-b border-ratp-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ratp-gray-900">
              {format(selectedDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                className="p-2 text-ratp-gray-600 hover:text-ratp-gray-800 hover:bg-ratp-gray-200 rounded-md transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-2 text-sm text-ratp-gray-600 hover:text-ratp-gray-800 hover:bg-ratp-gray-200 rounded-md transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                className="p-2 text-ratp-gray-600 hover:text-ratp-gray-800 hover:bg-ratp-gray-200 rounded-md transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            {/* En-tête des jours */}
            <thead className="bg-ratp-gray-50">
              <tr>
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => (
                  <th
                    key={day}
                    className="px-4 py-3 text-center text-sm font-semibold text-ratp-gray-700 border-r border-ratp-gray-200 last:border-r-0"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Corps du calendrier */}
            <tbody className="bg-white divide-y divide-ratp-gray-200">
              {weeks.map((week, weekIndex) => (
                <tr key={weekIndex}>
                  {week.map((day) => {
                    const planning = getPlanningForDate(day);
                    const isCurrentMonth = isSameMonth(day, selectedDate);
                    const dayIsToday = isToday(day);
                    const serviceStyle = planning ? getServiceStyle(planning.type_service) : null;
                    
                    return (
                      <td
                        key={day.getTime()}
                        className={`p-2 h-24 border-r border-ratp-gray-200 last:border-r-0 align-top ${
                          !isCurrentMonth ? 'bg-ratp-gray-25 opacity-50' : ''
                        } ${dayIsToday ? 'bg-blue-50' : ''}`}
                      >
                        {/* Numéro du jour */}
                        <div className={`text-sm font-medium mb-2 ${
                          dayIsToday ? 'text-ratp-blue font-bold' : 
                          isCurrentMonth ? 'text-ratp-gray-900' : 'text-ratp-gray-400'
                        }`}>
                          {format(day, 'd')}
                        </div>
                        
                        {/* Planning du jour */}
                        {planning && (
                          <div
                            className={`text-xs px-2 py-1 rounded-md min-h-8 ${serviceStyle.color}`}
                            title={`${serviceStyle.label}${planning.horaire_debut ? ` (${planning.horaire_debut}-${planning.horaire_fin})` : ''}${planning.poste ? ` - ${planning.poste}` : ''}`}
                          >
                            <div className="font-semibold">{planning.type_service}</div>
                            {planning.horaire_debut && planning.horaire_fin && (
                              <div className="mt-1 opacity-80">
                                {planning.horaire_debut.substring(0,5)}-{planning.horaire_fin.substring(0,5)}
                              </div>
                            )}
                            {planning.poste && (
                              <div className="mt-1 font-medium opacity-90">
                                {planning.poste}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const sortedPlannings = [...filteredPlannings].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200">
        <div className="px-6 py-4 border-b border-ratp-gray-200">
          <h2 className="text-lg font-semibold text-ratp-gray-900">Liste de vos plannings</h2>
        </div>
        
        <div className="p-6">
          {sortedPlannings.length > 0 ? (
            <div className="space-y-3">
              {sortedPlannings.map((planning) => {
                const serviceStyle = getServiceStyle(planning.type_service);
                return (
                  <div
                    key={planning.id}
                    className="flex items-center justify-between p-4 bg-ratp-gray-50 rounded-lg hover:bg-ratp-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-ratp-gray-900">
                        {format(new Date(planning.date), 'EEEE d MMMM yyyy', { locale: fr })}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${serviceStyle.color}`}>
                        {serviceStyle.label}
                      </div>
                    </div>
                    <div className="text-sm text-ratp-gray-600 text-right">
                      {planning.horaire_debut && planning.horaire_fin && (
                        <div className="font-medium">
                          {planning.horaire_debut} - {planning.horaire_fin}
                        </div>
                      )}
                      {planning.poste && (
                        <div className="text-ratp-blue font-semibold mt-1">
                          {planning.poste}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-ratp-gray-300 mx-auto mb-3" />
              <p className="text-ratp-gray-500">Aucun planning trouvé pour cette période</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ratp-blue mb-4"></div>
        <p className="text-ratp-gray-500">Chargement du planning...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* En-tête de la page */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ratp-gray-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-ratp-blue" />
              Mon Planning Personnel
            </h1>
            <p className="text-ratp-gray-600 mt-2">
              Consultez votre planning de services T8
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filtre par type de service */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-ratp-gray-400" />
              <select
                value={filters.type_service}
                onChange={(e) => setFilters({ ...filters, type_service: e.target.value })}
                className="border border-ratp-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ratp-blue"
              >
                <option value="">Tous les services</option>
                {Object.entries(serviceTypes).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>
            
            {/* Basculer vue */}
            <div className="flex rounded-md shadow-sm border border-ratp-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                  viewMode === 'calendar'
                    ? 'bg-ratp-blue text-white'
                    : 'bg-white text-ratp-gray-700 hover:bg-ratp-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendrier</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 border-l border-ratp-gray-300 ${
                  viewMode === 'list'
                    ? 'bg-ratp-blue text-white'
                    : 'bg-white text-ratp-gray-700 hover:bg-ratp-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Liste</span>
              </button>
            </div>
            
            <button
              onClick={loadPlannings}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-ratp-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Affichage du planning */}
      {viewMode === 'calendar' ? renderCalendarView() : renderListView()}

      {/* Légende et statistiques */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Légende */}
        <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-6">
          <h3 className="text-lg font-semibold text-ratp-gray-900 mb-4">Légende des services</h3>
          
          <div className="space-y-4">
            {/* Grouper par créneaux */}
            {[
              { creneau: 'repos', title: 'Repos', color: 'text-gray-700' },
              { creneau: 'matin', title: 'Services Matin (6h-14h)', color: 'text-green-700' },
              { creneau: 'apres_midi', title: 'Services Après-midi (14h-22h)', color: 'text-orange-700' },
              { creneau: 'nuit', title: 'Services Nuit (22h-6h)', color: 'text-gray-700' },
              { creneau: 'formation', title: 'Formation', color: 'text-purple-700' }
            ].map(({ creneau, title, color }) => {
              const services = Object.entries(serviceTypes).filter(([_, v]) => v.creneau === creneau);
              if (services.length === 0) return null;
              
              return (
                <div key={creneau}>
                  <h4 className={`text-sm font-medium mb-2 ${color}`}>{title}</h4>
                  <div className="flex flex-wrap gap-2">
                    {services.map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${value.color}`}></div>
                        <span className="text-xs text-ratp-gray-600">{value.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-6">
          <h3 className="text-lg font-semibold text-ratp-gray-900 mb-4">Statistiques du mois</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ratp-gray-600">Services programmés</span>
              <span className="text-lg font-bold text-ratp-gray-900">
                {filteredPlannings.filter(p => p.type_service !== 'R').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-ratp-gray-600">Jours de repos</span>
              <span className="text-lg font-bold text-ratp-gray-900">
                {filteredPlannings.filter(p => p.type_service === 'R').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-ratp-gray-600">Services matin</span>
              <span className="text-lg font-bold text-green-600">
                {filteredPlannings.filter(p => {
                  const style = getServiceStyle(p.type_service);
                  return style.creneau === 'matin';
                }).length}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-ratp-gray-600">Services après-midi</span>
              <span className="text-lg font-bold text-orange-600">
                {filteredPlannings.filter(p => {
                  const style = getServiceStyle(p.type_service);
                  return style.creneau === 'apres_midi';
                }).length}
              </span>
            </div>
          </div>
          
          {/* Informations postes */}
          <div className="mt-6 pt-4 border-t border-ratp-gray-200">
            <h4 className="text-sm font-medium text-ratp-gray-900 mb-2">Postes T8</h4>
            <div className="text-xs text-ratp-gray-600 space-y-1">
              <div><strong>POSTE 1</strong> : Surveillance Nord</div>
              <div><strong>POSTE 2</strong> : Surveillance Sud</div>
              <div><strong>POSTE 3</strong> : Mobile terrain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;

