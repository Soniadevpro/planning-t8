// src/components/planning/CollectivePlanning.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const CollectivePlanning = () => {
  const { user } = useAuth();
  const [plannings, setPlannings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Types de services avec couleurs (basés sur votre image)
 // Dans CollectivePlanning.jsx, remplacez la section serviceTypes par :

const serviceTypes = {
  // REPOS
  'R': { label: 'Repos', color: 'bg-gray-200 text-gray-800', creneau: 'repos' },
  
  // SERVICES MATIN (6h-14h) - Tons bleus/verts
  '31': { label: 'Ligne 31', color: 'bg-green-400 text-green-900', creneau: 'matin' },
  '35': { label: 'Ligne 35', color: 'bg-green-500 text-white', creneau: 'matin' },
  '39': { label: 'Ligne 39', color: 'bg-blue-400 text-blue-900', creneau: 'matin' },
  'RT30': { label: 'RT30', color: 'bg-teal-400 text-teal-900', creneau: 'matin' },
  '140': { label: 'Ligne 140', color: 'bg-cyan-500 text-white', creneau: 'matin' },
  
  // SERVICES APRÈS-MIDI (14h-22h) - Tons oranges/jaunes
  '750': { label: 'Ligne 750', color: 'bg-orange-500 text-white', creneau: 'apres_midi' },
  '700': { label: 'Ligne 700', color: 'bg-yellow-500 text-yellow-900', creneau: 'apres_midi' },
  '40': { label: 'Ligne 40', color: 'bg-amber-400 text-amber-900', creneau: 'apres_midi' },
  '50': { label: 'Ligne 50', color: 'bg-orange-400 text-orange-900', creneau: 'apres_midi' },
  '90': { label: 'Ligne 90', color: 'bg-yellow-400 text-yellow-900', creneau: 'apres_midi' },
  
  // SERVICES NUIT (22h-6h) - Tons sombres
  '661': { label: 'Ligne 661', color: 'bg-gray-700 text-white', creneau: 'nuit' },
  '730': { label: 'Ligne 730', color: 'bg-slate-800 text-white', creneau: 'nuit' },
  'N1': { label: 'Noctilien N1', color: 'bg-purple-800 text-white', creneau: 'nuit' },
  'N2': { label: 'Noctilien N2', color: 'bg-indigo-800 text-white', creneau: 'nuit' },
  
  // FORMATION - Tons violets
  'CCF': { label: 'Formation CCF', color: 'bg-purple-400 text-purple-900', creneau: 'formation' },
  'TS': { label: 'Formation TS', color: 'bg-violet-400 text-violet-900', creneau: 'formation' },
  
  // RÉSERVES - Tons neutres
  'RT31': { label: 'Réserve RT31', color: 'bg-gray-400 text-white', creneau: 'reserve' },
  'RT34': { label: 'Réserve RT34', color: 'bg-gray-500 text-white', creneau: 'reserve' },
  'RT35': { label: 'Réserve RT35', color: 'bg-gray-600 text-white', creneau: 'reserve' },
};

  useEffect(() => {
    if (user?.role === 'agent' || user?.role === 'superviseur') {
      loadWeeklyPlanning();
    }
  }, [currentWeek, user]);

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { locale: fr, weekStartsOn: 1 }); // Lundi
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const loadWeeklyPlanning = async () => {
    try {
      setLoading(true);
      const weekDays = getWeekDays();
      const startDate = format(weekDays[0], 'yyyy-MM-dd');
      const endDate = format(weekDays[6], 'yyyy-MM-dd');

      const [planningsRes, agentsRes] = await Promise.all([
        api.get(`/plannings/collectif/?date_debut=${startDate}&date_fin=${endDate}`),
        api.get('/agents/')
      ]);

      setPlannings(planningsRes.data);
      setAgents(agentsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement du planning collectif:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanningForAgentAndDay = (agentId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plannings.find(p => p.agent_id === agentId && p.date === dateStr);
  };

  const getServiceStyle = (service) => {
    if (!service) return serviceTypes['R'];
    
    // Chercher d'abord une correspondance exacte
    if (serviceTypes[service]) {
      return serviceTypes[service];
    }
    
    // Si c'est un nombre, chercher une correspondance partielle
    const serviceStr = service.toString();
    for (const [key, value] of Object.entries(serviceTypes)) {
      if (serviceStr.includes(key) || key.includes(serviceStr)) {
        return value;
      }
    }
    
    // Style par défaut
    return { label: service, color: 'bg-gray-100 text-gray-700', textColor: 'text-gray-700' };
  };

  const weekDays = getWeekDays();

  if (!user?.role || (user.role !== 'agent' && user.role !== 'superviseur')) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ratp-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Planning Collectif
        </h2>
        <button
          onClick={loadWeeklyPlanning}
          disabled={loading}
          className="p-1 text-ratp-gray-500 hover:text-ratp-gray-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between bg-ratp-gray-50 p-2 rounded-md">
        <button
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          className="p-1 text-ratp-gray-600 hover:text-ratp-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <span className="text-sm font-medium text-ratp-gray-900">
          Semaine du {format(weekDays[0], 'dd/MM', { locale: fr })} au {format(weekDays[6], 'dd/MM', { locale: fr })}
        </span>
        
        <button
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="p-1 text-ratp-gray-600 hover:text-ratp-gray-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Tableau du planning */}
      <div className="bg-white border border-ratp-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ratp-blue mx-auto"></div>
            <p className="text-sm text-ratp-gray-500 mt-2">Chargement...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* En-tête du tableau */}
              <thead className="bg-ratp-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ratp-gray-700 uppercase tracking-wider border-r border-ratp-gray-300">
                    Agent
                  </th>
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <th
                        key={day.getTime()}
                        className={`px-3 py-2 text-center text-xs font-medium uppercase tracking-wider border-r border-ratp-gray-300 ${
                          isToday 
                            ? 'bg-ratp-blue text-white' 
                            : 'text-ratp-gray-700'
                        }`}
                      >
                        <div>{format(day, 'EEEE', { locale: fr }).substring(0, 3).toUpperCase()}</div>
                        <div className="text-xs">{format(day, 'dd/MM')}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              {/* Corps du tableau */}
              <tbody className="bg-white divide-y divide-ratp-gray-200">
                {agents.map((agent, agentIndex) => (
                  <tr key={agent.id} className={agentIndex % 2 === 0 ? 'bg-white' : 'bg-ratp-gray-50'}>
                    {/* Nom de l'agent */}
                    <td className="px-3 py-2 text-sm font-medium text-ratp-gray-900 border-r border-ratp-gray-300 bg-ratp-gray-50">
                      <div className="truncate max-w-24" title={agent.full_name}>
                        {agent.full_name}
                      </div>
                    </td>
                    
                    {/* Services pour chaque jour */}
                {weekDays.map((day) => {
  const planning = getPlanningForAgentAndDay(agent.id, day);
  const service = planning?.type_service || 'R';
  const serviceStyle = getServiceStyle(service);
  const isToday = isSameDay(day, new Date());
  
  return (
    <td
      key={`${agent.id}-${day.getTime()}`}
      className={`px-2 py-3 text-center border-r border-ratp-gray-300 ${
        isToday ? 'bg-blue-50' : ''
      }`}
    >
      <div
        className={`px-2 py-2 rounded-md text-xs font-bold min-h-12 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${serviceStyle.color}`}
        title={`${agent.full_name} - ${serviceStyle.label} - ${format(day, 'dd/MM/yyyy', { locale: fr })}${planning?.horaire_debut ? ` (${planning.horaire_debut}-${planning.horaire_fin})` : ''}`}
      >
        <div className="text-center">
          {service}
        </div>
        {/* Afficher les horaires si disponibles */}
        {planning?.horaire_debut && planning?.horaire_fin && service !== 'R' && (
          <div className="text-xs opacity-80 mt-1">
            {planning.horaire_debut.substring(0,5)}-{planning.horaire_fin.substring(0,5)}
          </div>
        )}
        {/* Afficher le poste si disponible */}
        {planning?.poste && (
          <div className="text-xs opacity-70 mt-1">
            {planning.poste}
          </div>
        )}
      </div>
    </td>
  );
})}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Légende */}
     // Remplacez la section légende par :
<div className="mt-6 bg-white rounded-lg shadow-sm border border-ratp-gray-200 p-4">
  <h3 className="text-lg font-semibold text-ratp-gray-900 mb-4">Légende des services</h3>
  
  <div className="space-y-4">
    {/* Repos */}
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Repos</h4>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-800">R</div>
        <span className="text-sm">Repos</span>
      </div>
    </div>
    
    {/* Services par créneaux */}
    <div>
      <h4 className="text-sm font-medium text-green-700 mb-2">Services Matin (6h-14h)</h4>
      <div className="flex flex-wrap gap-2">
        {Object.entries(serviceTypes).filter(([_, v]) => v.creneau === 'matin').map(([key, value]) => (
          <div key={key} className="flex items-center space-x-1">
            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${value.color}`}>
              {key}
            </div>
            <span className="text-xs">{value.label}</span>
          </div>
        ))}
      </div>
    </div>
    
    <div>
      <h4 className="text-sm font-medium text-orange-700 mb-2">Services Après-midi (14h-22h)</h4>
      <div className="flex flex-wrap gap-2">
        {Object.entries(serviceTypes).filter(([_, v]) => v.creneau === 'apres_midi').map(([key, value]) => (
          <div key={key} className="flex items-center space-x-1">
            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${value.color}`}>
              {key}
            </div>
            <span className="text-xs">{value.label}</span>
          </div>
        ))}
      </div>
    </div>
    
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Services Nuit (22h-6h)</h4>
      <div className="flex flex-wrap gap-2">
        {Object.entries(serviceTypes).filter(([_, v]) => v.creneau === 'nuit').map(([key, value]) => (
          <div key={key} className="flex items-center space-x-1">
            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${value.color}`}>
              {key}
            </div>
            <span className="text-xs">{value.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default CollectivePlanning;